<template>
    <div>
        <h1>Group Project Peer Evaluation</h1>
        <form v-on:submit.prevent="submit">
            <input type="text" name="student" id="student" placeholder="Your Name" v-model="submitter" required>
            <br>
            <br>
            <label for="peer">Please select your course: </label>
            <select name="course" id="course" v-model="course" required>
                <option disabled value="">Please select your course</option>
                <option value="comp905">COMP 905</option>
                <option value="comp66">COMP 66</option>
            </select>
            <br>
            <br>
            <label for="peer">Please select a peer: </label>
            <select name="peer" id="peer" v-model="userId" required v-if="course === 'comp905'">
                <option disabled value="">Please select a peer</option>
                <option v-for="student in comp905Users" :value="student.id" :key="student.id">{{ student.name }}</option>
            </select>
            <select name="peer" id="peer" v-model="userId" required v-if="course === 'comp66'">
                <option disabled value="">Please select a peer</option>
                <option  v-for="student in comp66Users" :value="student.id" :key="student.id">{{ student.name }}</option>
            </select>
            <div class="feedback" v-for="(question, index) in questions" :key="index">
                <h3>{{ question.prompt }}</h3>
                <div class="option" v-for="(option, count) in question.options" :key="count">
                    <input type="radio" :id="'option' + (count + 1)" :value="{optionId: option.id, questionId: question.id, submitter: submitter, userId: userId}" v-model="responses[index]">
                    <label :for="'option' + (count + 1)">{{ option.value }}</label>
                    <br>
                </div>
            </div>
            <input type="submit" value="Submit" style="margin-top: 30px; width: 200px;">
        </form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            questionOperationsDoc: `
                query QuestionQuery {
                    questions {
                    id
                    prompt
                    options {
                        id
                        questionId
                        value
                    }
                    }
                }
            `,
            userOperationsDoc: `
                query UserQuery {
                    users {
                    id
                    name
                    course
                    }
                }
            `,
            userId: null,
            submitter: null,
            course: null,
            comp905Users: [],
            comp66Users:[],
            questions: [],
            responses: []
        }
    },
    created() {
        this.startFetchQuestionQuery()
        this.startFetchUserQuery()
    },
    methods: {
        submit() {
            for (const response of this.responses) {
                if(!response) {
                    alert('You must select a response for all questions');
                    return
                }
            }
            let stringResponses = JSON.stringify(this.responses)
            stringResponses.replace(/\\"/g,"\uFFFF");
            stringResponses = stringResponses.replace(/"([^"]+)":/g, '$1:').replace(/\uFFFF/g, '\\"');
            const mutationOperationsDoc = `
                mutation ResponsesMutation {
                    insert_responses(objects: ${stringResponses}) {
                        affected_rows
                    }
                }
            `;
            this.startExecuteResponsesMutation(mutationOperationsDoc)
        },
        async fetchGraphQL(operationsDoc, operationName, variables) {
            const result = await fetch(
                "https://survey-w21.hasura.app/v1/graphql",
                {
                method: "POST",
                body: JSON.stringify({
                    query: operationsDoc,
                    variables: variables,
                    operationName: operationName
                })
                }
            );
            return await result.json();
        },
        fetchQuestionQuery() {
            return this.fetchGraphQL(
                this.questionOperationsDoc,
                "QuestionQuery",
                {}
            );
        },
        async startFetchQuestionQuery() {
            console.log('Called')
            const { errors, data } = await this.fetchQuestionQuery();
            if (errors) {
                // handle those errors like a pro
                console.error(errors);
            }
            // do something great with this precious data
            this.questions = data.questions;
        },
        executeResponsesMutation(mutationOperationsDoc) {
            return this.fetchGraphQL(
                mutationOperationsDoc,
                "ResponsesMutation",
                {}
            );
        },
        async startExecuteResponsesMutation(mutationOperationsDoc) {
            const { errors, data } = await this.executeResponsesMutation(mutationOperationsDoc);

            if (errors) {
                console.error(errors);
                alert('There was an error submitting your data, please try again')
                return
            }
            console.log(data);
            alert('Success, please complete this form for each of your group members (including yourself).')
            location.reload()
        },
        fetchUserQuery() {
            return this.fetchGraphQL(
                this.userOperationsDoc,
                "UserQuery",
                {}
            );
        },
        async startFetchUserQuery() {
            const { errors, data } = await this.fetchUserQuery();
            if (errors) {
                // handle those errors like a pro
                console.error(errors);
            }
            // do something great with this precious data
            for(const user of data.users) {
                if(user.course === 'comp905') {
                    this.comp905Users.push(user)
                } else if(user.course === 'comp66') {
                    this.comp66Users.push(user)
                }
            }

        }
    }
}
</script>

