# Hardhat ERC-20 Project

## Mô tả
Dự án này triển khai một token ERC-20 bằng Hardhat, bao gồm các tính năng:
- Giao dịch token giữa các ví.
- Hệ thống nhận thưởng tự động, tích lũy token theo thời gian.
- Quản lý phí giao dịch có thể chỉnh sửa bởi Owner.
- Giao diện web để người dùng tương tác với smart contract.

## Chức năng chính
- **Triển khai token ERC-20** với OpenZeppelin.
- **Hỗ trợ giao dịch token** giữa các ví.
- **Tính năng nhận thưởng tự động**, cho phép người dùng tích lũy token dựa trên thời gian giữ.
- **Hệ thống phí giao dịch** có thể được chỉnh sửa bởi Owner.
- **Giao diện web** để người dùng kiểm tra số dư, thực hiện giao dịch và nhận thưởng.

## Cấu trúc thư mục
```
├── contracts/            # Hợp đồng thông minh
│   ├── MyToken.sol       # Hợp đồng ERC-20 chính
├── scripts/              # Scripts triển khai và kiểm thử
│   ├── deploy.js         # Script triển khai hợp đồng
├── frontend/             # Giao diện web để tương tác
├── hardhat.config.js     # Cấu hình Hardhat
├── package.json          # Dependencies
├── README.md             # Tài liệu dự án
```

## Cài đặt
1. Clone repository:
   ```sh
   git clone <repo-url>
   cd hardhat-erc20
   ```

## Dependencies

### **Backend (Hardhat)**
1. **Hardhat**: Môi trường phát triển và kiểm thử smart contract.
   ```sh
   npm install --save-dev hardhat
   ```
2. **OpenZeppelin Contracts**: Thư viện triển khai các chuẩn ERC-20.
   ```sh
   npm install @openzeppelin/contracts
   ```
3. **Ethers.js**: Thư viện giao tiếp với blockchain.
   ```sh
   npm install ethers
   ```
4. **dotenv**: Quản lý biến môi trường.
   ```sh
   npm install dotenv
   ```
5. **Hardhat Plugins**:
   - **Hardhat Ethers**: Tích hợp Ethers.js với Hardhat.
     ```sh
     npm install --save-dev @nomicfoundation/hardhat-ethers
     ```
   - **Hardhat Chai Matchers**: Hỗ trợ kiểm thử với Chai.
     ```sh
     npm install --save-dev @nomicfoundation/hardhat-chai-matchers
     ```
   - **Hardhat Waffle**: Plugin kiểm thử smart contract.
     ```sh
     npm install --save-dev @nomiclabs/hardhat-waffle
     ```
6. **Mocha & Chai**: Framework kiểm thử và thư viện assertion.
   ```sh
   npm install --save-dev mocha chai
   ```

---

### **Frontend (React)**
1. **React**: Thư viện xây dựng giao diện người dùng.
   ```sh
   npm install react react-dom
   ```
2. **Vite**: Công cụ build nhanh cho React.
   ```sh
   npm install vite
   ```
3. **Tailwind CSS**: Framework CSS để xây dựng giao diện.
   ```sh
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init
   ```
4. **React Toastify**: Hiển thị thông báo (nếu cần).
   ```sh
   npm install react-toastify
   ```

---

### **Cài đặt tất cả dependencies**
Bạn có thể cài đặt tất cả dependencies cùng lúc bằng lệnh:
```sh
npm install --save-dev hardhat @openzeppelin/contracts ethers dotenv @nomicfoundation/hardhat-ethers @nomicfoundation/hardhat-chai-matchers @nomiclabs/hardhat-waffle mocha chai
npm install react react-dom vite tailwindcss postcss autoprefixer react-toastify
```

---

### **Kiểm tra dependencies**
Sau khi cài đặt, kiểm tra tệp `package.json` để đảm bảo tất cả dependencies đã được thêm vào.

## Triển khai hợp đồng
Chạy lệnh sau để chạy mạng testnet:
```sh
npx hardhat compile
npx hardhat node
```
Chạy lệnh sau để triển khai hợp đồng lên testnet:
```sh
npx hardhat run scripts/deploy.js --network localhost
```
Khi xuất hiện địa chỉ của contract, hãy thay thế vào CONTRACT_ADDRESS trong frontend/App.jsx

## Chạy giao diện web
1. Điều hướng đến thư mục `frontend`:
   ```sh
   cd frontend
   ```
2. Chạy ứng dụng:
   ```sh
   npm run dev
   ```

## Hướng dẫn sử dụng
- **Kết nối ví MetaMask**: Người dùng có thể kết nối ví để tương tác với hợp đồng.
- **Kiểm tra số dư và thực hiện giao dịch**: Hiển thị danh sách tài khoản và số dư, cho phép gửi token.
- **Nhận thưởng token theo thời gian**: Người dùng có thể nhận thưởng dựa trên thời gian giữ token.
- **Chỉnh sửa phí giao dịch**: Chủ sở hữu hợp đồng có thể thay đổi phí giao dịch thông qua giao diện.

## Công nghệ sử dụng
- **Solidity**: Sử dụng OpenZeppelin để triển khai token ERC-20.
- **Hardhat**: Môi trường phát triển và kiểm thử smart contract.
- **Ethers.js**: Giao tiếp với blockchain.
- **React.js**: Xây dựng giao diện người dùng.

## Tác giả
Hoàng Kim Chi - MSV: 22028046

## Giấy phép
MIT License