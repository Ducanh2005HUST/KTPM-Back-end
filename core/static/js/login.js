document.addEventListener("DOMContentLoaded", function () {
  const loginButton = document.querySelector("button[type='submit']");
  
  loginButton.addEventListener("click", async function (event) {
    event.preventDefault();
    
    const email = document.getElementById("typeEmailX-2").value.trim();
    const password = document.getElementById("typePasswordX-2").value.trim();
    
    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin đăng nhập");
      return;
    }
    
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    
    try {
      const response = await fetch("/auth/login/", {
        method: "POST",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        window.location.href = data.redirect_url || "/home/";
      } else {
        alert(data.message || "Sai email hoặc mật khẩu!");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Đã xảy ra lỗi trong quá trình đăng nhập.");
    }
  });
});

function getCookie(name) {
  let cookieValue = null;  
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");    
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
