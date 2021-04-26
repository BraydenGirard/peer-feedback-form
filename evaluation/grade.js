import fetch from "node-fetch";
import fs from 'fs'

const args = process.argv.slice(2);

function fetchGraphQL(operationsDoc, operationName, variables) {
    return fetch(
      "https://survey-w21.hasura.app/v1/graphql",
      {
        method: "POST",
        body: JSON.stringify({
          query: operationsDoc,
          variables: variables,
          operationName: operationName
        })
      }
    ).then((result) => result.json());
}

function fetchUsersByCourse() {
    return fetchGraphQL(
        `
            query UsersByCourseQuery {
                users(where: {course: {_eq: "${args[0]}"}}) {
                    course
                    id
                    name
                }
            }
        `,
        "UsersByCourseQuery",
        {}
    );
}

function fetchResponsesByUserId(id) {
    return fetchGraphQL(
        `
            query ResponsesByUserId {
                responses(where: {userId: {_eq: ${id}}}) {
                    question {
                        id
                        prompt
                    }
                    option {
                        value
                    }
                    submitter
                }
            }
        `,
        "ResponsesByUserId"
    );
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
} 

(async () => {
    try {
        const response = await fetchUsersByCourse()
        const users = response.data.users;
        let userGrades = []
        console.log(`Total users: ${users.length}`)
        let iteration = 1;
        for (let user of users) {
            await sleep(1200);
            console.log(`Fetching user ${iteration}`)
            iteration = iteration + 1;
            try {
                const responseInner = await fetchResponsesByUserId(user.id)
                const responses = responseInner.data.responses
                if(!responses || responses.length < 1) {
                    console.log(`No responses for ${user.name}`)
                    continue;
                }

                let grade = {
                    name: user.name,
                    participationScores: [],
                    codePercentageScores: [],
                    pacticipationAverage: 0,
                    codePercentageAverage: 0
                }

                if(userGrades["id-"+ user.id.toString()]) {
                    grade = userGrades["id-"+ user.id.toString()]
                }

                for (let response of responses) {
                    // Contribution 1 - 5
                    if(response.question.id === 1) {
                        grade.participationScores.push(parseInt(response.option.value))
                        // Percentage of code
                    } else if(response.question.id === 2) {
                        grade.codePercentageScores.push(parseInt(response.option.value))
                    }
                }
                userGrades["id-"+ user.id.toString()] = grade
            }
            catch(error) {
                console.error(error);
            }
        }
        let finalGrades = []
        for(let key in userGrades) {
            let userGrade = userGrades[key]
            let codePercentageTotal = 0;
            let count = 0;
            for (let codePercentageScore of userGrade.codePercentageScores) {
                count = count + 1;
                codePercentageTotal = codePercentageTotal + codePercentageScore;
            }
            userGrade.codePercentageAverage = Math.round(codePercentageTotal / count);
            count = 0;
            let participationScoreTotal = 0;
            for(let participationScore of userGrade.participationScores) {
                count = count + 1;
                participationScoreTotal += participationScore;
            }
            userGrade.pacticipationAverage = Math.round(participationScoreTotal / count);
            finalGrades.push(userGrade)
        }
        try {
            fs.writeFileSync('results.json', JSON.stringify(finalGrades))
        } catch (err) {
            console.error(err)
        }
    } catch(error) {
        console.error(error);
    }
})()
