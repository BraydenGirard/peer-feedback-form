# Peer Feedback Grading Tool

## Dev Setup
```
npm install -g @vue/cli
npm i -g @vue/cli-service-global
cd tools
npm install
```

## Loading Students
1. Visit [Hasura](https://cloud.hasura.io/project/5d66099e-f763-46c4-a20f-86f0c3a398e3/console/data/schema/public) and remove all users and responses from DB
2. Place a Blackboard Grade Center export csv with the name students.csv in the tools directory
3. Run ``` node load.js course ``` where course is all one word and the name of the course the students belong to
4. Check the App.vue file in the root directory and update all references to course names to match courses loaded

## Hosting
```
npm install --global surge
vue build
surge dist
```

## Grading Students
```
cd tools
node grade.js
```