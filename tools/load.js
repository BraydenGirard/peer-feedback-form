import fetch from "node-fetch"
import csv from 'csvtojson'

async function fetchGraphQL(operationsDoc, operationName, variables) {
    const result = await fetch("https://survey-slc.hasura.app/v1/graphql", {
        method: "POST",
        body: JSON.stringify({
            query: operationsDoc,
            variables: variables,
            operationName: operationName,
        }),
    });
    return await result.json();
}

(async () => {
    try {
        const csvFilePath = 'students.csv'

        const jsonArray = await csv().fromFile(csvFilePath);

        const course = process.argv.slice(2)[0];

        const students = jsonArray.map(e => {
            return {
                course,
                name: `${e['First Name']} ${e['Last Name']} - (${e['Username']})`
            }
        })

        const studentsStr = JSON.stringify(students)
            .replace(/"([^"]+)":/g, "$1:")
            .replace(/\uFFFF/g, '\\"')

        const mutation = `mutation UserMutation { insert_users(objects: ${studentsStr}) { affected_rows } }`

        const { errors, data } = await fetchGraphQL(mutation, "UserMutation", {});

        if (errors) {
            console.log(errors);
            console.log("There was an error submitting your data, please try again");
            return;
        }

        console.log("Import finished successfully")
    } catch (err) {
        console.log(err)
        console.log('Import failed')
    }
})()