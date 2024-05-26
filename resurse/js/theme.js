console.log("heeeeeeeee");
document.addEventListener("DOMContentLoaded", () => {
    const themeToggleButton = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    themeToggleButton.addEventListener("click", () => {
        const currentTheme = document.body.classList.contains("light-theme") ? "light" : "dark";
        const newTheme = currentTheme === "light" ? "dark" : "light";
        setTheme(newTheme);
    });

    function setTheme(theme) {
        const themeIcon = document.getElementById("theme-icon");
        if (theme === "dark") {
            console.log("Tema dark");
            document.body.classList.add("dark-theme");
            document.body.classList.remove("light-theme");
            themeIcon.classList.remove("fa-sun-o");
            themeIcon.classList.add("fa-moon-o");
        } else {
            console.log("Tema light");
            document.body.classList.add("light-theme");
            document.body.classList.remove("dark-theme");
            themeIcon.classList.remove("fa-moon-o");
            themeIcon.classList.add("fa-sun-o");
        }
        localStorage.setItem("theme", theme);
    }    
});