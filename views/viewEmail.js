const html = (token, email) => {
  return `
      <html lang="en">
        <head>
          <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Đăng ký tài khoản thành công</title>
              <!-- Bộ CSS Bootstrap -->
              <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
                <!-- CSS tùy chỉnh -->
                <style>
      /* Thêm CSS tùy chỉnh nếu cần */
                </style>
              </head>
              <body>
                <div class="container mt-5">
                  <div class="d-flex justify-content-center align-items-center">
                    <img src="https://cdn.pixabay.com/photo/2014/09/03/06/56/welcome-434118_640.png" class="card-img-top" alt="Welcome Image">
                  </div>

                  <div class="alert alert-success" role="alert">
                    <h4 class="alert-heading">Xác thực tài khoản của bạn!</h4>

                    <button type="button" class="btn btn-primary">
                      <a href="http://localhost:3000/verifiEmail?token=${token}&email=${email}">Hãy click vào đây để xác nhận</a>
                    </button>
                    
                    <p>Mã có hiệu lực trong vòng 1h. Vui lòng nhập mã trong khoảng thời gian quy định.</p>
                  </div>
                </div>
              </body>
            </html>
  `
}

module.exports = { html }