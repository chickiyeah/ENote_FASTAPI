try{
  const outBtn = document.querySelector("#logOutBtn");
  const accessToken = sessionStorage.getItem("access-token");
  
  outBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fetch("http://3.34.125.70:83/api/user/logout", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken,
      },
      body: JSON.stringify({
        access_token: accessToken,
      }),
    })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error("400 아니면 500 에러남");
        } else {
          return response.json();
        }
      })
      .then((data) => {
        console.log(data);
        sessionStorage.clear();
        localStorage.clear();
        alert("로그아웃 성공");
      })
      .catch((error) => {
        console.log(error);
      });
  });
}catch (error) {

}

        