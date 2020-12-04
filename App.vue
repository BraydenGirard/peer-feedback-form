<template>
    <div>
        <h1>COMP905 Group Project Peer Evaluation</h1>
        <form v-on:submit.prevent="submit">
            <input type="text" name="student" id="student" placeholder="Your Name" v-model="student">
            <select name="peer" id="peer" v-model="peer">
                <option disabled value="">Please select a peer</option>
                <option v-for="student in peers" :value="student" :key="student">{{ student }}</option>
            </select>
            <div class="feedback" v-for="(question, index) in questions" :key="index">
                <h3>{{ question }}</h3>
                <div class="option" v-for="(option, count) in options" :key="count">
                    <input type="radio" :id="'option' + (count + 1)" :value="count + 1" v-model="answers[index]">
                    <label :for="'option' + (count + 1)">{{ count + 1 }}</label>
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
            student: '',
            peer: '',
            peers: ['Tom', 'Sally', 'Bob'],
            questions: ['How much effort did your selected peer contribute', 'Was your selected peer easy to work with'],
            options: [1, 2, 3, 4, 5],
            answers: []
        }
    },
    methods: {
        submit() {
            console.log(this.peer + ' selected by ' + this.student + ' answered ' + this.answers)
        }
    }
}
</script>

