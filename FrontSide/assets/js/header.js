const profile = document.querySelector(".profile-hide");
const logProfile = document.querySelector("#logProfile");
//로그인 상태
window.addEventListener('load',()=>{
    if(localStorage.getItem("refresh-token") !== null){
        logProfile.innerHTML = "<a href='#'>SU</a>";
        profile.style.display = "block";
//로그아웃 상태
    }else{
        logProfile.innerHTML = "<a href='#'>로그인하셈</a>"
        profile.style.display = "none"
    }
})

            



