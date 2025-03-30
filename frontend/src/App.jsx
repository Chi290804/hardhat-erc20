import { useEffect, useState } from "react";
import { ethers } from "ethers";
import tokenABI from "./TokenABI.json"; // ABI của smart contract

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Địa chỉ contract trên localhost

function App() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [balances, setBalances] = useState({});
    const [owner, setOwner] = useState("");
    const [fee, setFee] = useState("0.1");
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [newFee, setNewFee] = useState("");
    const [selectedAccount, setSelectedAccount] = useState(null); // Tài khoản đang được chọn

    // Kết nối MetaMask khi trang load
    useEffect(() => {
        connectWallet();
    }, []); // Chỉ gọi connectWallet() khi component mount
    
    useEffect(() => {
        if (contract && accounts.length > 0) {
            const interval = setInterval(updateBalances, 5000);
            return () => clearInterval(interval);
        }
    }, [contract, accounts]); // Chạy lại khi contract hoặc accounts thay đổi
    
    const [lastClaimInfo, setLastClaimInfo] = useState({ timeElapsed: "Đang tải...", rewardEarned: "Đang tải..." });

    useEffect(() => {
        if (!contract || !selectedAccount) return;
    
        let interval;
        async function fetchClaimInfo() {
            try {
                const lastClaimTimestamp = await contract.lastClaimTime(selectedAccount);
                const lastClaimTime = Number(lastClaimTimestamp);
    
                if (lastClaimTime === 0) {
                    setLastClaimInfo({ timeElapsed: "Chưa nhận thưởng lần nào", rewardEarned: "0 MTK" });
                    return;
                }
    
                const rewardRate = await contract.rewardRate();
    
                // Cập nhật mỗi giây
                interval = setInterval(() => {
                    const now = Math.floor(Date.now() / 1000);
                    const timeElapsed = now - lastClaimTime;
                    const rewardEarned = (timeElapsed * Number(rewardRate)) / (10 ** 18); // Chia cho 10¹⁸ để ra MTK
    
                    const days = Math.floor(timeElapsed / (24 * 3600));
                    const hours = Math.floor((timeElapsed % (24 * 3600)) / 3600);
                    const minutes = Math.floor((timeElapsed % 3600) / 60);
                    const seconds = timeElapsed % 60;
    
                    setLastClaimInfo({
                        timeElapsed: `${days} ngày, ${hours} giờ, ${minutes} phút, ${seconds} giây`,
                        rewardEarned: `${formatNumber(rewardEarned)} MTK`,
                    });
                }, 1000);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin claim:", error);
            }
        }
    
        fetchClaimInfo();
    
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [contract, selectedAccount]);
    
    
    // Tự động cập nhật số dư khi có block mới
    useEffect(() => {
        if (provider) {
            provider.on("block", async () => {
                await updateBalances();
            });
        }
    }, [provider]);
    

    async function connectWallet() {
        if (!window.ethereum) {
            alert("MetaMask không được cài đặt!");
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        console.log("Token ABI:", tokenABI);

        const contract = new ethers.Contract(CONTRACT_ADDRESS, tokenABI.abi, signer);

        // Lấy danh sách tài khoản
        const accounts = await provider.listAccounts();

        // Lấy tài khoản đang kết nối
        if (accounts.length > 0) {
            setSelectedAccount(accounts[0].address); // Lưu tài khoản đang chọn
        }

        // Lấy số dư của từng tài khoản
        const balances = {};
        for (let acc of accounts) {
            balances[acc.address] = ethers.formatUnits(await contract.balanceOf(acc.address), 18);
        }

        // Lấy địa chỉ owner & phí giao dịch
        const ownerAddress = await contract.owner();
        const feeAmount = await contract.transactionFee();

        setProvider(provider);
        setSigner(signer);
        setContract(contract);
        setAccounts(accounts);
        setBalances(balances);
        setOwner(ownerAddress);
        setFee((Number(feeAmount) / 100).toFixed(2));  // ✅ Chuyển BigInt thành Number trước khi chia
    }

    async function claimReward() {
        if (!contract || !selectedAccount) return;
        try {
            const previousBalance = await contract.balanceOf(selectedAccount); // 🔥 Lấy số dư trước giao dịch từ blockchain
            const previousBalanceFormatted = ethers.formatUnits(previousBalance, 18); // Chuyển về đơn vị MTK
    
            const tx = await contract.claimReward();
            await tx.wait();
    
            await updateBalances(); // 🔥 Cập nhật số dư mới từ blockchain
    
            const newBalance = await contract.balanceOf(selectedAccount); // 🔥 Lấy số dư sau giao dịch
            const newBalanceFormatted = ethers.formatUnits(newBalance, 18); // Chuyển về đơn vị MTK
    
            alert(`✅ Nhận thưởng thành công!\nSố dư trước: ${formatNumber(previousBalanceFormatted)} MTK\nSố dư sau: ${formatNumber(newBalanceFormatted)} MTK`);
        } catch (error) {
            console.error("Lỗi khi nhận thưởng:", error);
            alert("❌ Lỗi khi nhận thưởng!");
        }
    }
    
    

    async function updateBalances() {
        if (!contract) return;
        if (accounts.length === 0) return;
        try {
            const balances = {};
            for (let acc of accounts) {
                balances[acc.address] = ethers.formatUnits(await contract.balanceOf(acc.address), 18);
            }
            setBalances(balances);
        } catch (error) {
            console.error("Lỗi khi cập nhật số dư:", error);
        }
    }
    

    async function sendTokens() {
        if (!signer || !recipient || !amount) {
            alert("Vui lòng nhập đủ thông tin!");
            return;
        }
    
        try {
            const amountWei = ethers.parseUnits(amount, 18);
            const feeRate = BigInt(await contract.transactionFee()); // Ép kiểu về BigInt
    
            const senderAddress = await signer.getAddress();
            const senderBalanceBefore = BigInt(await contract.balanceOf(senderAddress));
            const recipientBalanceBefore = BigInt(await contract.balanceOf(recipient));
            const ownerBalanceBefore = BigInt(await contract.balanceOf(owner));
    
            // Thực hiện giao dịch
            const tx = await contract.transfer(recipient, amountWei);
            await tx.wait();
    
            // Lấy số dư sau giao dịch
            const senderBalanceAfter = BigInt(await contract.balanceOf(senderAddress));
            const recipientBalanceAfter = BigInt(await contract.balanceOf(recipient));
            const ownerBalanceAfter = BigInt(await contract.balanceOf(owner));
    
            // Tính toán phí giao dịch
            const feeAmount = (amountWei * feeRate) / ethers.parseUnits("1", 18);
            const senderSpent = senderBalanceBefore - senderBalanceAfter;
            const recipientReceived = recipientBalanceAfter - recipientBalanceBefore;
            const ownerReceived = ownerBalanceAfter - ownerBalanceBefore;
    
            alert(
                `✅ Giao dịch thành công!\n\n` +
                `📜 Hash: ${tx.hash}\n\n` +
                `👤 Người nhận nhận được: ${formatNumber(ethers.formatUnits(recipientReceived, 18))} MTK\n` +
                `📈 Phí giao dịch: ${formatNumber(ethers.formatUnits(feeAmount, 18))} MTK\n` +
                `🏦 Owner nhận được: ${formatNumber(ethers.formatUnits(ownerReceived, 18))} MTK\n\n` +
                `💰 Số dư sau giao dịch:\n` +
                `👤 Người nhận: ${formatNumber(ethers.formatUnits(recipientBalanceAfter, 18))} MTK\n` +
                `🏦 Owner: ${formatNumber(ethers.formatUnits(ownerBalanceAfter, 18))} MTK`
            );
    
            updateBalances();
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi khi gửi token!");
        }
    }
    
    

    async function changeFee() {
        if (!signer || owner !== await signer.getAddress()) {
            alert("Chỉ owner có thể thay đổi phí!");
            return;
        }

        const parsedFee = parseFloat(newFee) * 100; // Chuyển về phần nghìn
        const maxAllowedFee = ethers.parseUnits("0.1", 18); // 10%

        if (parsedFee > maxAllowedFee) {
            alert("Phí phải nhỏ hơn hoặc bằng 10%!");
            return;
        }

        try {
            const tx = await contract.setTransactionFee(parsedFee);
            await tx.wait();
            alert(`Đã cập nhật phí giao dịch thành: ${newFee} MTK`);
            setFee(newFee);
        } catch (error) {
            console.error(error);
            alert("Lỗi khi thay đổi phí!");
        }
    }

    const formatNumber = (num) => {
        return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(num);
    };

    return (
        <div className="container">
            <h1 className="title">MyToken Dashboard</h1>

            <div style={{ textAlign: "center" }}>
                <button onClick={connectWallet} className="button">
                    Kết nối MetaMask
                </button>
            </div>

            {selectedAccount && (
                <div className="section">
                    <h3 className="section-title">🟢 Tài khoản đang chọn:</h3>
                    <p className="address">{selectedAccount}</p>
                </div>
            )}

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Địa chỉ</th>
                            <th>Số dư (MTK)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((acc) => (
                            <tr key={acc.address}>
                                <td className="address">{acc.address}</td>
                                <td>{formatNumber(balances[acc.address])}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="section">
                <h3 className="section-title">Thông tin hợp đồng:</h3>
                <p>
                    <strong>Owner:</strong> <span>{owner}</span>
                </p>
                <p>
                    <strong>Phí giao dịch:</strong>{" "}
                    <span className="warning">{fee}%</span>
                </p>
            </div>
            <div className="section">
                <h3 className="section-title">⏳ Thông tin nhận thưởng gần nhất</h3>
                <p><strong>Thời gian trôi qua:</strong> {lastClaimInfo.timeElapsed}</p>
                <p><strong>Thưởng tích lũy:</strong> {lastClaimInfo.rewardEarned}</p>
            </div>

            <div className="section">
                <h3 className="section-title">🎁 Nhận thưởng</h3>
                <button onClick={claimReward} className="button" style={{ backgroundColor: "#f59e0b" }}>
                    Nhận thưởng
                </button>
            </div>
            <div className="section">
                <h3 className="section-title">💰 Số dư của bạn</h3>
                <p><strong>Địa chỉ:</strong> {selectedAccount}</p>
                <p>
                <strong>Số dư:</strong> {balances[selectedAccount] ? `${formatNumber(balances[selectedAccount])} MTK` : "Đang tải..."}
                </p>            
            </div>

            {owner === accounts[0]?.address && (
                <div className="section">
                    <h3 className="section-title">Thay đổi phí giao dịch:</h3>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <input
                            type="text"
                            placeholder="Nhập phí mới (%)"
                            value={newFee}
                            onChange={(e) => setNewFee(e.target.value)}
                            className="input"
                        />
                        <button onClick={changeFee} className="button" style={{ backgroundColor: "#f59e0b" }}>
                            Cập nhật
                        </button>
                    </div>
                </div>
            )}

            <div className="section">
                <h3 className="section-title">Chuyển token:</h3>
                <div>
                    <input
                        type="text"
                        placeholder="Địa chỉ người nhận"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="input"
                    />
                    <input
                        type="text"
                        placeholder="Số lượng"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input"
                    />
                    <button onClick={sendTokens} className="button" style={{ backgroundColor: "#10b981" }}>
                        Gửi Token
                    </button>
                </div>
            </div>
            <div className="section">
                <div className="info-box">
                    <h4>Cách tính phí giao dịch:</h4>
                    <p>
                        Khi bạn thực hiện giao dịch, một khoản phí giao dịch sẽ được tính dựa trên số lượng token bạn gửi. 
                        Phí giao dịch hiện tại là <strong>{fee}%</strong>.
                    </p>
                    <p>
                        Ví dụ: Nếu bạn gửi <strong>{formatNumber(1000000000000)} MTK</strong>, phí giao dịch sẽ là:
                    </p>
                    <ul>
                        <li>
                            Phí giao dịch = {formatNumber(1000000000000)} MTK × {fee}% ={" "}
                            {formatNumber((1000000000000 * fee) / 100)} MTK
                        </li>
                        <li>
                            Người nhận sẽ nhận được: {formatNumber(1000000000000)} MTK -{" "}
                            {formatNumber((1000000000000 * fee) / 100)} MTK ={" "}
                            {formatNumber(1000000000000 - (1000000000000 * fee) / 100)} MTK
                        </li>
                        <li>Phí giao dịch sẽ được chuyển đến tài khoản của Owner.</li>
                    </ul>
                </div>
            </div>
            <div className="section">
            <div className="info-box">
                <h4>🎁 Cơ chế nhận thưởng</h4>
                <p>
                    Hệ thống thưởng tự động dựa trên **thời gian giữ token**. Khi bạn nhận thưởng, smart contract tính toán số token dựa trên công thức:
                </p>
                <ul>
                    <li><strong>Phần thưởng = Thời gian giữ (giây) × 1,000,000</strong></li>
                </ul>
                <p>
                    Ví dụ: Nếu bạn giữ token trong **100 giây** và reward rate là **1,000,000 MTK/s**, bạn sẽ nhận được **100,000,000 MTK**.
                </p>
            </div>
        </div>

        </div>
        
    );
}

export default App;