firebase.auth().onAuthStateChanged((user) => {
    if(user){
        alert('Login Successful');
    } else {
        window.location.replace('login');
    }
})

function signIn(){
let userName = document.getElementById('inputEmail').value;
let userPwd =  document.getElementById('inputPwd').value;

firebase.auth().signInWithEmailAndPassword(userName, userPwd).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    if(errorCode === 'auth/wrong-pasword'){
        alert('Wrong Password');
        console.log(errorCode);
    } else {
        alert(errorMessage);
    }

});

}