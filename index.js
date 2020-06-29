const express = require('express');
const app = express();
const PORT = 8080;

// Initializing a Class definition
class Class {
    constructor(className, grade) {
        this.className = className;
        this.grade = grade;
    }
}

// Each pre-populated student starts off with the same class schedule and grade
classArray = [];
classArray.push(new Class("Math","A"));
classArray.push(new Class("English","B"));
classArray.push(new Class("Physics","C"));

// Initializing a Student definition
class Student {
    constructor(studentId, name, age, email) {
        this.studentId = studentId;
        this.name = name;
        this.age = age;
        this.email = email;
        // Clone the classes template
        this.grades = Array.from(classArray);
    }
    addGrade(className, grade) {
        this.grades.push(new Class(className, grade));
    }
}

// Add the initial cadre
studentsArray = [];
studentsArray.push(new Student(1234, "Steve", "29", "steve@washburn.org"));
studentsArray.push(new Student(5678, "Peter", "32", "peter@washburn.org"));
studentsArray.push(new Student(9123, "Sophie", "32", "peter@washburn.org"));

studentA = new Student(2345, "Fred", "29", "fred@washburn.org");
studentA.addGrade("Chemistry", "C");

studentB = new Student(3456, "Cindy", "29", "cindy@washburn.org");
studentB.addGrade("Chemistry", "A");

studentsArray.push(studentA);
studentsArray.push(studentB);

app.use(express.json());

app.get('/', (req, res) => {
    res.send('welcome');
});

// Return student info
app.get('/students/:studentId', (req, res) => {
    const studentId = parseInt(req.params.studentId);
    const studentInfo = studentsArray.find(o => o.studentId === studentId);
    res.send(`Student: \nName: ${studentInfo.name} \nAge: ${studentInfo.age} \nEmail: ${studentInfo.email}`);
});

// Return list of student names or the list of names meeting the query
app.get('/students', (req, res) => {
    let studentNames = '';
    for (const key in req.query) {
        console.log(key, req.query[key])
    }
    const studentNameQuery = req.query.name;
    const studentAgeQuery = req.query.age;
    const studentEmailQuery = req.query.email;
    let filteredArray = Array.from(studentsArray);

    // Filter by name
    if (studentNameQuery) {
        filteredArray = filteredArray.filter((o => { return o.name === studentNameQuery;}));
    }
    if (studentAgeQuery) {
        filteredArray = filteredArray.filter((o => { return o.age === studentAgeQuery;}));
    }
    if (studentEmailQuery) {
        filteredArray = filteredArray.filter((o => { return o.email === studentEmailQuery;}));
    }
    
    filteredArray.forEach(element => {
        studentNames = studentNames.concat('\n' + element.name);
    });

    res.send(`Students: ${studentNames}`);
});

// Retrieve the grades for a specific student
app.get('/grades/:studentId', function (req, res) {
    const studentId = parseInt(req.params.studentId);
    const studentInfo = studentsArray.find(o => o.studentId === studentId);
    const grades = JSON.stringify(studentInfo.grades.map(classElement => (classElement.className + ' : ' + classElement.grade)));
    res.send(`Grades for Student: 
        Name: ${studentInfo.name} 
        Grades: ${grades}`);
});

// Add a grade for a student
// TODO:  Does not validate that the supplied Student ID is a valid one.
app.post('/grade', function (req, res) {
    if (req.body.studentId && req.body.className && req.body.grade) {
        const studentId = parseInt(req.body.studentId);
        const studentInfo = studentsArray.find(o => o.studentId === studentId);
        studentInfo.grades.push(new Class(req.body.className, req.body.grade));
         res.send(`Grade Registered for student: ${studentId}`);
    } else {
        res.status(400).send({
            message: 'You must supply the student ID, class name, and grade.'
        });
    }
});

// Add a new student
// TODO:  Does not validate the structure of the email address.
app.post('/register', function (req, res) {
    if (req.body.name && req.body.email) {
        studentsArray.push(new Student(parseInt(req.body.studentId), req.body.name, req.body.age, req.body.email));
        res.send('Got a POST request for register');
    } else {
        res.status(400).send({
            message: 'You must supply the name and email address.'
        });
    }
});

app.listen(PORT);