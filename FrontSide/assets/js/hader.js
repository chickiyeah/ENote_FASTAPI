
let load = ()=>{
    const atoken = sessionStorage.getItem("refresh_token")
    const nickname = sessionStorage.getItem("user_nickname")
    const profile = document.querySelector(".profile");
    const burgerd = document.querySelector(".burgerd-hide");
    // const accessToken = sessionStorage.getItem("access_token");
    /**
                <p id="logProfile"><a href="#">SU</a></p>
                <ul class="profile-hide"> 
                    <li><a href="/mypage">내계정</a></li>
                    <li><a href="/mypage/unregister">탈퇴하기</a></li>
                    <li id="logOutBtn"><a href="#">로그아웃</a></li>              
                </ul>
     */
    // console.log(atoken)
    if (atoken == null) {
        console.log("No token")
        burgerd.insertAdjacentHTML('beforeend', `<li><a href="/" style="position:absolute;top:7rem;left:3rem">기록하기</a></li>`)
        burgerd.insertAdjacentHTML('beforeend', `<li><a href="/storybook" style="position:absolute;top:9rem;left:3rem">스토리북</a></li>`)
        burgerd.insertAdjacentHTML('beforeend', `<li><a href="/word" style="position:absolute;top:11rem;left:3rem">단어카드</a></li>`)
        burgerd.insertAdjacentHTML('beforeend', `<li><a href="/calendar" style="position:absolute;top:13rem;left:3rem">캘린더</a></li>`)
        burgerd.insertAdjacentHTML('beforeend', `<li><a href="/login" style="position:absolute;top:19rem;left:3rem">로그인</a></li>`)
        profile.insertAdjacentHTML('beforeend',`<p id="logProfile"><a href="/login"><i class="fa-solid fa-right-to-bracket"></i></a></p>`)
        $(function () {
          // 햄버거 토글
          $(".burgerd-hide").hide();
          $(".burger").click(function (e) {
            console.log(0);
            e.preventDefault();
            $(this).next().slideToggle("slide");
          });
          // 스토리북 토글
          $(".story-hide").hide();
          $(".menu>i")
            .off("click")
            .on("click", function (e) {
              //off 메서드를 혼합하여 사용함으로써 해당 이벤트 중복 오류를 막을 수 있었습니다.
              e.preventDefault();
              // console.log(0);
              $(this).next().slideToggle("fast");
            });
        });
        return
    }else{
        //node = document.createElement("")
        burgerd.insertAdjacentHTML('beforeend', `<li><a href="/" style="position:absolute;top:7rem;left:3rem">기록하기</a></li>`)
        burgerd.insertAdjacentHTML('beforeend', `<li><a href="/storybook" style="position:absolute;top:9rem;left:3rem">스토리북</a></li>`)
        burgerd.insertAdjacentHTML('beforeend', `<li><a href="/word" style="position:absolute;top:11rem;left:3rem">단어카드</a></li>`)
        burgerd.insertAdjacentHTML('beforeend', `<li><a href="/calendar" style="position:absolute;top:13rem;left:3rem">캘린더</a></li>`)
        burgerd.insertAdjacentHTML('beforeend', `<li><a href="/mypage" style="position:absolute;top:19rem;left:3rem">내계정</a></li>`)
        burgerd.insertAdjacentHTML('beforeend', `<li><a href="/mypage/unregister" style="position:absolute;top:21rem;left:3rem">탈퇴하기</a></li>`)
        burgerd.insertAdjacentHTML('beforeend', `<li id="logOutBtn1"><a href="#" style="position:absolute;top:25rem;left:3rem">로그아웃</a></li>`)
        profile.insertAdjacentHTML('beforeend',`<p id="logProfile"><a href="#">${nickname.slice(0,1)}</a></p>
        <ul class="profile-hide"> 
            <li><a href="/mypage">내계정</a></li>
            <li><a href="/mypage/unregister">탈퇴하기</a></li>
            <li id="logOutBtn"><a href="#">로그아웃</a></li>              
        </ul>`)

        $(function () {
            // 프로필 토글
            $(".profile-hide").hide();
            $(".profile>p").click(function (e) {
              console.log(0);
              e.preventDefault();
              $(this).next().slideToggle("fast");
            });
            // 햄버거 토글
            $(".burgerd-hide").hide();
            $(".burger").click(function (e) {
              console.log(0);
              e.preventDefault();
              $(this).next().slideToggle("fast");
            });
            // 스토리북 토글
            $(".story-hide").hide();
            $(".menu>i")
              .off("click")
              .on("click", function (e) {
                //off 메서드를 혼합하여 사용함으로써 해당 이벤트 중복 오류를 막을 수 있었습니다.
                e.preventDefault();
                // console.log(0);
                $(this).next().slideToggle("fast");
              });
          });

        const outBtn = document.querySelector("#logOutBtn");

        outBtn.addEventListener("click", (e) => {
          e.preventDefault();
          fetch("http://35.212.150.195/api/user/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              'Authorization': sessionStorage.getItem("access_token"),
            },
            body: JSON.stringify({
              //access_token: sessionStorage.getItem("access_token"),
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
              location.href = "/"
            })
            .catch((error) => {
              alert(error);
            });
        });

        const outBtn1 = document.querySelector("#logOutBtn1");

        outBtn1.addEventListener("click", (e) => {
          e.preventDefault();
          fetch("http://35.212.150.195/api/user/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              'Authorization': sessionStorage.getItem("access_token"),
            },
            body: JSON.stringify({
              //access_token: sessionStorage.getItem("access_token"),
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
              location.href = "/"
            })
            .catch((error) => {
              alert(error);
            });
        });
    }
}
window.onload(load());