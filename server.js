/*
|----------------------------------------------------------
| Statement of Authorship:
| StAuth10065: I Dylan Hernandez, 000307857 certify that this material is my original work.
| No other person's work has been used without due acknowledgement.
| I have not made my work available to anyone else.
|----------------------------------------------------------
*/

// Required packages
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

// Return the teacher page
app.get('/teacher', function(req, res){
    res.sendFile(__dirname + '/view.teacher.html');
});

// Return the student page
app.get('/student', function(req, res){
    res.sendFile(__dirname + '/view.student.html');
});

// Initially correct answer is blank
var CORRECT_ANSWER_SA = "";
var CORRECT_ANSWER_TF = false;
var CORRECT_ANSWER_MC = [];

// If we have a connection...
io.on('connection', function(socket){
    //When the teacher submits a question to the server
    socket.on('submit_question', function(questionData){
        switch (questionData.type) {
            case "SA":
                CORRECT_ANSWER_SA = questionData.answer;
                socket.broadcast.emit('deliver_question', questionData);
            break;
            case "TF":
                CORRECT_ANSWER_TF = questionData.answer;
                socket.broadcast.emit('deliver_question', questionData);
            break;
            case "MC":
                CORRECT_ANSWER_MC.length = 0; //Clear collection first
                if(questionData.answer.optionA.checked === true) {
                    CORRECT_ANSWER_MC.push(questionData.answer.optionA.value);
                }
                if(questionData.answer.optionB.checked === true) {
                    CORRECT_ANSWER_MC.push(questionData.answer.optionB.value);
                }
                if(questionData.answer.optionC.checked === true) {
                    CORRECT_ANSWER_MC.push(questionData.answer.optionC.value);
                }
                if(questionData.answer.optionD.checked === true) {
                    CORRECT_ANSWER_MC.push(questionData.answer.optionD.value);
                }
                if(questionData.answer.optionE.checked === true) {
                    CORRECT_ANSWER_MC.push(questionData.answer.optionE.value);
                }
                socket.broadcast.emit('deliver_question', questionData);
            break;
        }
    });
    //When a student submits an answer to the server
    socket.on('submit_answer', function(data) {
        switch(data.type) {
            case "SA":
                var results = {
                    correct: (CORRECT_ANSWER_SA == data.answer),
                    answer: CORRECT_ANSWER_SA,
                    givenAnswer: data.answer,
                    studentName: data.name,
                    type: data.type
                };
                socket.broadcast.emit('result_question_teacher', results);
                io.to(socket.id).emit('result_question', results);
            break;
            case "TF":
                var results = {
                    correct: (CORRECT_ANSWER_TF == data.answer),
                    answer: (CORRECT_ANSWER_TF) ? "TRUE" : "FALSE",
                    studentName: data.name,
                    type: data.type
                };
                socket.broadcast.emit('result_question_teacher', results);
                io.to(socket.id).emit('result_question', results);
            break;
            case "MC":
                var isCorrect = false;
                var correctAnswers = "";
                for(var x = 0; x < CORRECT_ANSWER_MC.length; x++) {
                    correctAnswers += CORRECT_ANSWER_MC[x] + " ";
                    if(CORRECT_ANSWER_MC[x] == data.answer) {
                        isCorrect = true;
                    }
                }
                var results = {
                    correct: isCorrect,
                    answer: correctAnswers,
                    studentName: data.name,
                    type: data.type
                };
                socket.broadcast.emit('result_question_teacher', results);
                io.to(socket.id).emit('result_question', results);
            break;
        }
    });
});

// Have the server listen...
http.listen(3000, function(){
    console.log('listening on *:3000');
});
