const Modal = function (id) {
  this.heading = "This is the heading";
  this.content = "this is the body content";
  this.id = id;
  this.status;
  this.open = function () {
    const modal = document.querySelector(this.id);
    modal.style.visibility = "visible";
    modal.children[0].style.opacity = 1;
    modal.children[0].style.height = "400px";
    modal.children[0].children[0].innerHTML = `<h1>${this.heading}</h1>`;
    modal.children[0].children[1].innerHTML = `<h1>${this.content}</h1>`;
    this.status = true;
  };
  this.close = function (e) {
    const ArrayOfClasses = Array.from(e.target.classList);
    if (!ArrayOfClasses.includes("modal-close")) return;
    const modal = document.querySelector(this.id);
    modal.children[0].style.opacity = 0;
    modal.children[0].style.height = "0px";
    modal.style.visibility = "hidden";

    this.status = false;
  };
};
let modala = new Modal("#modal");

