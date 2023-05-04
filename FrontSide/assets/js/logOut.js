try{
  const outBtn = document.querySelector("#logOutBtn");
  const accessToken = sessionStorage.getItem("access_token");
  
  outBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fetch("http://35.212.150.195/api/user/logout", {
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
        if (response.status === 422 || response.status === 500) {
          throw new Error("오류가 발생했습니다. 관리자에게 문의해주세요.");
        } else if (response.status === 200) {
          return response.json();
        }
      })
      .then((data) => {
        localStorage.clear();
        sessionStorage.clear();
        alert("로그아웃 성공");
      })
      .catch((error) => {
        alert(error);
      });
  });
}catch (error) {

}

        