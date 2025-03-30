// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable(msg.sender) {
    uint256 public transactionFee = 10; // 0.1% (lưu trữ dưới dạng phần nghìn để chính xác hơn)
    mapping(address => uint256) public lastClaimTime;
    uint256 public rewardRate = 10 ** 18; // Số token thưởng mỗi giây (điều chỉnh theo nhu cầu)

    constructor(uint256 initialSupply) ERC20("MyToken", "MTK") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    function setTransactionFee(uint256 newFee) external onlyOwner {
        require(newFee <= 100, "Fee must be 10% or lower"); // Giới hạn phí tối đa 10%
        transactionFee = newFee;
    }

    function setRewardRate(uint256 newRate) external onlyOwner {
        rewardRate = newRate;
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _claimReward(msg.sender); // Cập nhật phần thưởng trước khi gửi
        _claimReward(recipient);

        uint256 fee = (amount * transactionFee) / 10000;
        uint256 amountAfterFee = amount - fee;

        _transfer(_msgSender(), owner(), fee);
        _transfer(_msgSender(), recipient, amountAfterFee);

        return true;
    }

    function _claimReward(address user) internal {
        if (lastClaimTime[user] > 0) {
            uint256 timeElapsed = block.timestamp - lastClaimTime[user];
            uint256 reward = timeElapsed * rewardRate;
            _mint(user, reward);
        }
        lastClaimTime[user] = block.timestamp;
    }

    function claimReward() external {
        _claimReward(msg.sender);
    }
}
