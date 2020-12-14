<template>
    <div>
        <h1>COMP905 Group Project Peer Evaluation</h1>
        <form v-on:submit.prevent="submit">
            <input type="text" name="student" id="student" placeholder="Your Name" v-model="submitter" required>
            <select name="peer" id="peer" v-model="peer" required>
                <option disabled value="">Please select a peer</option>
                <option v-for="student in peers" :value="student" :key="student">{{ student }}</option>
            </select>
            <div class="feedback" v-for="(question, index) in questions" :key="index">
                <h3>{{ question.prompt }}</h3>
                <div class="option" v-for="(option, count) in question.options" :key="count">
                    <input type="radio" :id="'option' + (count + 1)" :value="option.value" v-model="answers[index]">
                    <label :for="'option' + (count + 1)">{{ option.value }}</label>
                    <br>
                </div>
            </div>
            <input type="submit" value="Submit">
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
                    }
                }
            `,
            questionId: null,
            optionId: null,
            userId: null,
            submitter: null,
            users: [],
            questions: [],
            answers: []
        }
    },
    created() {
        this.startFetchQuestionQuery()
        this.startFetchUserQuery()
    },
    methods: {
        submit() {
            console.log(this.peer + ' selected by ' + this.student + ' answered ' + this.answers)
            const mutationOperationsDoc = `
                mutation MyMutation {
                    insert_responses_one(object: {questionId: ${this.questionId}, userId: ${this.userId}, optionId: ${this.optionId}, submitter: ${this.submitter}}) {
                    id
                    }
                }
            `;
            this.startExecuteMyMutation(mutationOperationsDoc)
        },
        async fetchGraphQL(operationsDoc, operationName, variables) {
            const result = await fetch(
                "https://striking-cowbird-63.hasura.app/v1/graphql",
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
        executeMyMutation(mutationOperationsDoc) {
            return this.fetchGraphQL(
                mutationOperationsDoc,
                "MyMutation",
                {}
            );
        },
        async startExecuteMyMutation(mutationOperationsDoc) {
            const { errors, data } = await this.executeMyMutation(mutationOperationsDoc);

            if (errors) {
                // handle those errors like a pro
                console.error(errors);
            }

            // do something great with this precious data
            console.log(data);
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
            this.users = data.users
        }
    }
}
</script>

