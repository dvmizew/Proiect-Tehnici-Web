// console.log("heeeeeeeee");
// document.addEventListener("DOMContentLoaded", () => {
//     const themeToggleButton = document.getElementById("theme-toggle");
//     const themeIcon = document.getElementById("theme-icon");
//     const savedTheme = localStorage.getItem("theme") || "light";
//     setTheme(savedTheme);

//     themeToggleButton.addEventListener("click", () => {
//         const currentTheme = document.body.classList.contains("light-theme") ? "light" : "dark";
//         const newTheme = currentTheme === "light" ? "dark" : "light";
//         setTheme(newTheme);
//     });

//     function setTheme(theme) {
//         const themeIcon = document.getElementById("theme-icon");
//         if (theme === "dark") {
//             console.log("Tema dark");
//             document.body.classList.add("dark-theme");
//             document.body.classList.remove("light-theme");
//             themeIcon.classList.remove("fa-sun-o");
//             themeIcon.classList.add("fa-moon-o");
//         } else {
//             console.log("Tema light");
//             document.body.classList.add("light-theme");
//             document.body.classList.remove("dark-theme");
//             themeIcon.classList.remove("fa-moon-o");
//             themeIcon.classList.add("fa-sun-o");
//         }
//         localStorage.setItem("theme", theme);
//     }
// });

let tema = localStorage.getItem("tema");
if (tema)
    document.body.classList.add("dark");

window.addEventListener("DOMContentLoaded", function () {
    document.getElementById("tema").onclick = function () {
        if (document.body.classList.contains("dark")) {
            document.body.classList.remove("dark")
            localStorage.removeItem("tema");
        }
        else {
            document.body.classList.add("dark")
            localStorage.setItem("tema", "dark");
        }
    }
});