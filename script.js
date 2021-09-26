// Code for CRUD

// Global values
function getValue()
{
    student_id = document.getElementById("student-id").value;
    student_name = document.getElementById("student-name").value;
    student_program = document.getElementById("student-program").value;
    student_status = document.getElementById("student-status").value;
}

function insertForm(id, name, program, status)
{
    document.getElementById("student-id").value = id;
    document.getElementById("student-name").value = name;
    document.getElementById("student-program").value = program;
    document.getElementById("student-status").value = status;
}

function clearValue()
{
    insertForm("", "", "", "");
}

function insert(){
    // Get Value from the form
    getValue();

    firebase.database().ref("student/" + student_id).set({
        StudentName : student_name,
        StudentProgram : student_program,
        StudentStatus : student_status
    });
}

function read()
{
    // Get values from the form
    getValue();

    firebase.database().ref("student/" + student_id).on('value', function(snapshot){
        insertForm(
            student_id,
            snapshot.val().StudentName,
            snapshot.val().StudentProgram,
            snapshot.val().StudentStatus
        ) ;
    });
}

function update()
{
    // Get values from the form
    getValue();

    firebase.database().ref("student/" + student_id).update({
        StudentName : student_name,
        StudentProgram : student_program,
        StudentStatus : student_status
    });
}

function remove()
{
    // Get values from the form
    getValue();

    firebase.database().ref("student/" + student_id).remove();
}


// Code for TO-DO-LIST

// Global Variable
task_count = 0;

function displayTasks()
{
    var list = document.getElementById("to-do-list");

    database.ref("to-do-list/").on('value', function(snapshot){

        //Clear previous value
        list.innerHTML = "";

        snapshot.forEach(function(childSnapshot){
            var data = childSnapshot.val().taskName;
            list.innerHTML = list.innerHTML + "<li>" + data 
            + " <span class='btn btn-success' onclick='editTask(" + '"' + childSnapshot.key + '"' + ")'>Edit</span>" +
            "<span class='btn btn-danger' onclick='deleteTask(" + '"' + childSnapshot.key+ '"' +")'>Delete</span></li>";

        });
        
    });
}

function addTask()
{
    next_task_id = task_count + 1;
    new_task = document.getElementById("taks-field").value;

    if(new_task != null && new_task != "")
    {
        // Insert new task to the database
        database.ref("to-do-list/").push({
            taskName : new_task
        });
    }
    else
    {
        alert("The tasks name is required!");
    }

}

function editTask(task_id)
{
    task_name = prompt("Please enter a new tasks");

    // Update the tasks
    if(task_name != null && task_name != "")
    {
        database.ref("to-do-list/" + task_id).update({
            taskName : task_name
        });

        // Refresh the lisk
        //displayTasks();
    }
}

function deleteTask(task_id){

    var confirmDelete = confirm("Are you sure you want to delete this task?");

    if(confirmDelete)
    {
        firebase.database().ref("to-do-list/" + task_id).remove();

        // Refresh the lisk
        displayTasks();
    }
}

//Code for Firebase Storage
var file_property = [];

function renderFile(event){
    var upload_btn = document.getElementById("upload-file");
    var uploaded_img = document.getElementById("uploaded-img");
    var reader = new FileReader();
    file_property = event.target.files;

    reader.onload = function (){
        uploaded_img.src = reader.result;
        console.log(reader)
    }
    reader.readAsDataURL(file_property[0])
}

function uploadFile(){
    var uploaded_img = document.getElementById("upload-file").files[0].name;
    var file_name = new Date().getTime() + "." + uploaded_img.split(".").pop();

    var uploadTask = storage.ref("Images/" + file_name);
    var ImageRef = database.ref("imageStorage/");

    uploadTask.put(file_property[0]).then((snapshot) => {
        console.log('Uploaded a blob or file!');

        uploadTask.getDownloadURL()
        .then((url) => {
            ImageRef.push({
                imageName : file_name,
                imageURL: url
            });
        })
        .catch((error) => {
            // Handle any errors
            console.log(error)
        });
    });
}

function deleteFile(fileName, id){
    var deleteTask = storage.ref("Images/" + fileName);
    var ImageRef = database.ref("imageStorage/" + id);

    var confirmDelete = confirm("Are you sure you want to delete this file?");

    if(confirmDelete){
        // Delete the file
        deleteTask.delete().then(() => {
            // File deleted successfully
            console.log("File deleted successful!")
        }).catch((error) => {
            // Uh-oh, an error occurred!
            console.log(error)
        });

        //Delete record from database
        ImageRef.remove();
    }
}

function displayCurrentImageStorage(){
    var image_container = document.getElementById("current-img-storage");
    var ImageRef = database.ref("imageStorage");

    ImageRef.on('value', (snapshot) => {
        //Clear previous value
        image_container.innerHTML = "";

        snapshot.forEach(function(childSnapshot){
            image_container.innerHTML = image_container.innerHTML +
            "<div class='img-container text-center ml-2'>" +
            "<img src='" + childSnapshot.val().imageURL + "' class='storage-image' /> <br />" +
            "<button class='btn btn-danger mt-3' onclick='deleteFile(" + '"' + childSnapshot.val().imageName + '", ' + '"' + childSnapshot.key + '"' + ")'>Delete</button>" +
            "</div>";         
        });
        
    });

}