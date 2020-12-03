<template>
    <div>
        <h1>COMP905 Group Project Peer Evaluation</h1>
        <form v-on:submit.prevent="submit">
            <input type="text" name="student" id="student" placeholder="Your Name" v-model="student">
            <select name="peer" id="peer" v-model="peer">
                <option v-for="student in peers" :value="student" :key="student">{{ student }}</option>
            </select>
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
            peers: ['Tom', 'Sally', 'Bob']
        }
    },
    methods: {
        submit() {
            console.log(this.peer + ' selected by ' + this.student)
        }
    }
}
</script>

