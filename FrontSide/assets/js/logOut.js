try{
  const outBtn = document.querySelector("#logOutBtn");

  outBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fetch("http://3.34.125.70:83/api/user/logout", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: sessionStorage.getItem("access-token"),
      },
      body: JSON.stringify({
        access_token: sessionStorage.getItem("access-token"),
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
        sessionStorage.removeItem("refresh-token");
        sessionStorage.removeItem("acces-token");
        location.href = "/";
      })
      .catch((error) => {
        console.log(error);
      });
  });
}catch (error) {

}

        