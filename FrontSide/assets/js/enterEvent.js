export function clickEnter(className1, className2) {
  className1.addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      className2.click();
    }
  });
}
