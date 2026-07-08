// JavaScript Document - Hệ thống điều hành, Chatbot và Tính toán hóa đơn PFRESH

let cart = 0; // Biến toàn cục lưu số lượng sản phẩm trong giỏ
let discountPercent = 0; // Tỷ lệ giảm giá khởi tạo

// TỰ ĐỘNG CHẠY KHI TRANG TẢI XONG: Để tính toán lại tiền chính xác từ các sản phẩm mẫu
document.addEventListener("DOMContentLoaded", function() {
    // Kiểm tra nếu đang ở trang giỏ hàng (có bảng tính tiền) thì mới chạy tính toán
    if (document.getElementById("cartList")) {
        calculateCartTotal();
    }
});

// ==========================================================================
// THÀNH PHẦN 1: LOGIC GIỎ HÀNG VÀ TÍNH TOÁN HÓA ĐƠN
// ==========================================================================

// 1. Hàm thay đổi số lượng bằng nút + hoặc - (Chặn tuyệt đối số nhỏ hơn 1)
function changeQty(itemId, amount) {
    let inputField = document.getElementById("qty-" + itemId);
    if (!inputField) return;

    let currentVal = parseInt(inputField.value) || 1;
    let newVal = currentVal + amount;
    
    if (newVal >= 1) {
        inputField.value = newVal;
        updateRowTotal(itemId);
    }
}

// 2. Cập nhật thành tiền riêng của từng dòng sản phẩm
function updateRowTotal(itemId) {
    let row = document.querySelector(`.cart-item-row[data-id="${itemId}"]`);
    if (!row) return;

    let price = parseInt(row.getAttribute("data-price")) || 0;
    let qtyInput = document.getElementById("qty-" + itemId);
    let qty = parseInt(qtyInput.value) || 1;
    
    // Sửa lỗi UX: Nếu người dùng cố tình xóa trống hoặc nhập sai, tự đưa về 1
    if (qty < 1) {
        qty = 1;
        qtyInput.value = 1;
    }
    
    let subtotal = price * qty;
    document.getElementById("subtotal-" + itemId).innerText = subtotal.toLocaleString('vi-VN') + "đ";
    
    calculateCartTotal();
}

// 3. Xóa sản phẩm khỏi danh sách giỏ hàng
function removeItem(itemId) {
    let row = document.querySelector(`.cart-item-row[data-id="${itemId}"]`);
    if (row) {
        row.remove();
        calculateCartTotal();
    }
}

// 4. Tính toán toàn bộ hóa đơn tự động chính xác
function calculateCartTotal() {
    let rows = document.querySelectorAll(".cart-item-row");
    let tempTotal = 0;
    let totalItemsCount = 0;

    rows.forEach(row => {
        let price = parseInt(row.getAttribute("data-price")) || 0;
        let itemId = row.getAttribute("data-id");
        let qty = parseInt(document.getElementById("qty-" + itemId).value) || 0;
        tempTotal += price * qty;
        totalItemsCount += qty;
    });

    // Cập nhật lại biến cart toàn cục để các hàm khác xài chung dữ liệu số lượng
    cart = totalItemsCount; 
    let cartCountEl = document.getElementById("cartCount");
    if (cartCountEl) cartCountEl.innerText = cart;

    // Tính toán phí vận chuyển (Miễn phí cho đơn hàng từ 500.000đ)
    let shippingFee = 0;
    let shipPriceEl = document.getElementById("summaryShipPrice");
    
    if (shipPriceEl) {
        if (tempTotal > 0 && tempTotal < 500000) {
            shippingFee = 30000;
            shipPriceEl.innerText = "30.000đ";
            shipPriceEl.classList.remove("free-ship");
        } else if (tempTotal >= 500000) {
            shippingFee = 0;
            shipPriceEl.innerText = "Miễn phí";
            shipPriceEl.classList.add("free-ship");
        } else {
            shippingFee = 0;
            shipPriceEl.innerText = "0đ";
            shipPriceEl.classList.remove("free-ship");
        }
    }

    // Tính số tiền được giảm theo coupon
    let discountAmount = tempTotal * (discountPercent / 100);
    let finalTotal = tempTotal - discountAmount + shippingFee;

    // Hiển thị số liệu lên bảng tóm tắt bảo vệ DOM không bị crash
    if (document.getElementById("summaryTempPrice")) {
        document.getElementById("summaryTempPrice").innerText = tempTotal.toLocaleString('vi-VN') + "đ";
    }
    if (document.getElementById("summaryTotalPrice")) {
        document.getElementById("summaryTotalPrice").innerText = finalTotal.toLocaleString('vi-VN') + "đ";
    }

    // Nếu giỏ hàng trống rỗng
    if (rows.length === 0 && document.getElementById("cartList")) {
        document.getElementById("cartList").innerHTML = `<p style="padding: 30px; text-align: center; color: #7f8c8d; font-weight: 600;">Giỏ hàng của bạn đang trống.</p>`;
        if (document.getElementById("summaryTempPrice")) document.getElementById("summaryTempPrice").innerText = "0đ";
        if (document.getElementById("summaryTotalPrice")) document.getElementById("summaryTotalPrice").innerText = "0đ";
        if (shipPriceEl) {
            shipPriceEl.innerText = "0đ";
            shipPriceEl.classList.remove("free-ship");
        }
    }
}

// 5. Tính năng áp dụng coupon giảm giá thông minh
function applyCoupon() {
    let codeEl = document.getElementById("couponCode");
    let msgBox = document.getElementById("couponMessage");
    if (!codeEl || !msgBox) return;

    let code = codeEl.value.trim().toUpperCase();

    if (code === "PFRESH10") {
        discountPercent = 10;
        msgBox.innerText = "🎉 Áp dụng thành công! Bạn được giảm 10% tổng đơn hàng.";
        msgBox.style.color = "#27ae60";
    } else if (code === "") {
        discountPercent = 0;
        msgBox.innerText = "Vui lòng nhập mã để kiểm tra.";
        msgBox.style.color = "#e67e22";
    } else {
        discountPercent = 0;
        msgBox.innerText = "❌ Mã giảm giá không tồn tại hoặc đã hết hạn!";
        msgBox.style.color = "#e74c3c";
    }
    calculateCartTotal();
}

// 6. Tính năng xác nhận và tiến hành đặt hàng gửi Form
function processOrder(event) {
    event.preventDefault(); 
    
    let rows = document.querySelectorAll(".cart-item-row");
    if (rows.length === 0) {
        alert("Giỏ hàng của bạn đang trống! Vui lòng chọn sản phẩm trước khi thanh toán.");
        return;
    }

    let name = document.getElementById("orderName").value;
    let phone = document.getElementById("orderPhone").value;
    let address = document.getElementById("orderAddress").value;
    let totalMoney = document.getElementById("summaryTotalPrice").innerText;

    alert(`📦 ĐẶT HÀNG THÀNH CÔNG!\n\nCảm ơn bạn: ${name}\nSố điện thoại: ${phone}\nĐịa chỉ nhận: ${address}\nTổng giá trị thanh toán: ${totalMoney}\n\nChuyên viên PFRESH đang chuẩn bị đóng gói và sẽ giao hỏa tốc đến bạn trong vòng 1 giờ! 🥰`);
    
    let cartListEl = document.getElementById("cartList");
    if (cartListEl) cartListEl.innerHTML = "";
    
    document.getElementById("orderForm").reset();
    discountPercent = 0;
    if (document.getElementById("couponCode")) document.getElementById("couponCode").value = "";
    if (document.getElementById("couponMessage")) document.getElementById("couponMessage").innerText = "";
    
    calculateCartTotal();
}

// ==========================================================================
// THÀNH PHẦN 2: CÁC TÍNH NĂNG ĐIỀU HƯỚNG, TÀI KHOẢN VÀ CHATBOT FLOW
// ==========================================================================

function addCart() {
    cart++;
    let cartCountEl = document.getElementById("cartCount");
    if (cartCountEl) cartCountEl.innerHTML = cart;
    alert("Tuyệt vời! Sản phẩm trái cây tươi đã được thêm thành công vào giỏ hàng!");
}

function login() {
    let user = document.getElementById("login-user").value;
    let pass = document.getElementById("login-pass").value;

    if (user === "" || pass === "") {
        alert("Bạn vui lòng điền đầy đủ thông tin tài khoản nhé!");
    } else {
        alert("Đăng nhập thành công! Chào mừng hội viên '" + user + "' đến với PFRESH Fruit Mart.");
    }
}

function register(event) {
    event.preventDefault(); 
    let user = document.getElementById("reg-user").value;
    let city = document.getElementById("reg-city").value;
    
    alert("Chúc mừng tài khoản '" + user + "' tại khu vực '" + city + "' đã được cấp quyền thẻ Hội Viên ưu đãi!");
    document.getElementById("registerForm").reset();
}

function goShop() {
    let target = document.getElementById("products-section");
    if (target) target.scrollIntoView({ behavior: "smooth" });
}

function gotoAccount() {
    let target = document.getElementById("account-section");
    if (target) {
        target.scrollIntoView({ behavior: "smooth" });
    } else {
        window.location.href = "index.html#account-section";
    }
}

// --- KHU VỰC ĐIỀU KHIỂN CHATBOX CHUẨN ---

function toggleChat() {
    let chatBox = document.getElementById("chatBox");
    if (!chatBox) return;
    if (chatBox.style.display === "none" || chatBox.style.display === "") {
        chatBox.style.display = "flex";
        let chatMessages = document.getElementById("chatMessages");
        if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
        chatBox.style.display = "none";
    }
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

function selectSuggestion(text) {
    executeChatflow(text);
}

function sendMessage() {
    let inputField = document.getElementById("chatInput");
    if (!inputField) return;
    let messageText = inputField.value.trim();
    if (messageText === "") return;

    executeChatflow(messageText);
    inputField.value = "";
}

function executeChatflow(userText) {
    let chatMessages = document.getElementById("chatMessages");
    if (!chatMessages) return;

    // 1. Chèn tin nhắn của User
    let userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.innerText = userText;
    
    const suggestions = chatMessages.querySelector('.chat-suggestions');
    if (suggestions) {
        chatMessages.insertBefore(userMessage, suggestions);
    } else {
        chatMessages.appendChild(userMessage);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // 2. Phân tích từ khóa để Bot trả lời
    let botReplyText = "Dạ PFRESH đã nhận được thông tin từ bạn ạ. Hiện tại các tư vấn viên đang chuẩn bị khay trái cây đóng gói, shop sẽ liên hệ hỗ trợ bạn trực tiếp qua hotline hoặc khung chat này trong vòng 2 phút tới nhé! Quý khách cần nhắn thêm thông tin gì cứ để lại tại đây nha. 💚";
    let textLower = userText.toLowerCase();
    
    if (textLower.includes("hot") || textLower.includes("táo") || textLower.includes("nho") || textLower.includes("dâu") || textLower.includes("sản phẩm")) {
        botReplyText = "🍎 <strong>Gợi ý hôm nay từ Chuyên viên:</strong><br>• Táo Envy Mỹ giòn tan, ngọt lịm đậm đà giá ưu đãi chỉ 199k/kg.<br>• Nho Mẫu Đơn VietGAP chùm to quả mọng không hạt chín ngọt.<br>• Dâu Tây Đà Lạt hữu cơ hái mới sáng nay tại vườn.<br><br>Quý khách muốn shop lên đơn giao hỏa tốc loại nào gửi ngay tận nhà cho mình ạ? 🥰";
    } else if (textLower.includes("quà") || textLower.includes("giỏ")) {
        botReplyText = "🎁 <strong>Tư vấn Giỏ Quà Tặng Sang Trọng:</strong><br>PFRESH chuyên đóng giỏ quà kết hợp trái cây nhập khẩu thượng hạng kèm hoa tươi trang trí theo ngân sách từ 500k trở lên. Giỏ quà có kèm thiệp chúc mừng viết tay rất ý nghĩa.<br><br>Bạn cần tặng dịp sinh nhật, biếu đối tác hay chúc mừng sức khỏe để em gửi các mẫu ảnh đẹp nhất qua ạ?";
    } else if (textLower.includes("ship") || textLower.includes("phí") || textLower.includes("đổi trả") || textLower.includes("hỏng")) {
        botReplyText = "🛵 <strong>Chính sách Giao nhận & Đổi trả bảo vệ quyền lợi 100%:</strong><br>• Đơn hàng từ 500.000đ trở lên được <strong>Miễn phí giao hàng hỏa tốc trong 1 giờ</strong>.<br>• Cam kết 1 đổi 1 hoặc bù hàng miễn phí hoàn toàn nếu quả bị dập, lỗi hỏng khi mở khay.<br><br>Bạn hoàn toàn yên tâm khi mua sắm tại PFRESH nhé! Chúc bạn một ngày tràn đầy năng lượng!";
    } else if (textLower.includes("hội viên") || textLower.includes("vip") || textLower.includes("đăng ký")) {
        botReplyText = "⭐ <strong>Quyền lợi Khách Hàng Thân Thiết:</strong><br>Khi đăng ký hội viên thành công ở form bên dưới, bạn sẽ được tích điểm 5% cho mỗi lần mua sắm, nhận mã giảm giá 10% vào ngày sinh nhật và nhận quà tặng đặc biệt vào các dịp lễ tết ạ. Bạn nhớ điền form đăng ký phía dưới để nhận thẻ nhé!";
    }

    // 3. Trả lời mô phỏng độ trễ
    setTimeout(function() {
        let botMessage = document.createElement("div");
        botMessage.className = "message bot";
        botMessage.innerHTML = botReplyText;
        
        if (suggestions) {
            chatMessages.insertBefore(botMessage, suggestions);
        } else {
            chatMessages.appendChild(botMessage);
        }
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 600);
}

function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
        target.scrollIntoView({ behavior: "smooth" });
    }
}

// End of taitrang.js - PFRESH site script