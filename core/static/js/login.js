document.addEventListener("DOMContentLoaded", function(){
  document.querySelector("#login_form").addEventListener("submit", async function(event){
    event.preventDefault();
    
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    
    if(!username || !password){
      alert("Vui lòng nhập đầy đủ thông tin đăng nhập");
      return;
    }
    
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    
    try{
      const response = await fetch("/auth/login/",{
        method: "POST",
        headers: {
          "X-CSRFToken": getCookie("csrftoken")
        },
        body: formData
      });
      
      const data = await response.json();
      if(response.ok){
        window.location.href = data.redirect_url || "/home/";
      }
      else{
        alert(data.message || "Sai tên đăng nhập hoặc mật khẩu!");
      }
    }
    catch(error){
      console.error("Lỗi:", error);
      alert("Đã xảy ra lỗi trong quá trình đăng nhập.");
    }
  })
})
  
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
