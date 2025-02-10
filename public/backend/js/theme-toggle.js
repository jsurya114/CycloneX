document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;
  
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      body.classList.add(savedTheme);
      themeToggle.innerHTML = savedTheme === "dark-mode" 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    } else {
      body.classList.add("light-mode");
    }
  
    // Toggle theme on click
    themeToggle.addEventListener("click", () => {
      if (body.classList.contains("light-mode")) {
        body.classList.replace("light-mode", "dark-mode");
        localStorage.setItem("theme", "dark-mode");
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      } else {
        body.classList.replace("dark-mode", "light-mode");
        localStorage.setItem("theme", "light-mode");
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      }
    });
  });
  