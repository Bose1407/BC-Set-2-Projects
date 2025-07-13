import React, { useState } from 'react';
import { GraduationCap, Heart, Wallet, Eye, DollarSign } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { parseEther, formatEther } from 'ethers';
import toast from 'react-hot-toast';

// You'll need to replace this with your actual contract ABI
const EDU_FUND_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "studentName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "goal",
				"type": "uint256"
			}
		],
		"name": "CampaignCreated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "reason",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "goal",
				"type": "uint256"
			}
		],
		"name": "createCampaign",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "donate",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "donor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Donated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Withdrawn",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "campaignId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "campaigns",
		"outputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "studentName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "reason",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "goal",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "raised",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "withdrawn",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "donations",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getCampaign",
		"outputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "studentName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "reason",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "goal",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "raised",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "withdrawn",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const EDU_FUND_ADDRESS = "0x9F666E96eF0924841d7C7bFad24aF4d7968775f6"; // Replace with your deployed contract address

interface Campaign {
  owner: string;
  studentName: string;
  reason: string;
  goal: bigint;
  raised: bigint;
  withdrawn: boolean;
}

export function EduFund() {
  const { getContract, isConnected, account } = useWeb3();
  const [studentName, setStudentName] = useState('');
  const [reason, setReason] = useState('');
  const [goal, setGoal] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [searchCampaignId, setSearchCampaignId] = useState('');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);

  const createCampaign = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!studentName.trim() || !reason.trim() || !goal.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const goalInWei = parseEther(goal);
      setLoading(true);

      const contract = getContract(EDU_FUND_ADDRESS, EDU_FUND_ABI);
      if (!contract) return;

      const tx = await contract.createCampaign(studentName, reason, goalInWei);
      toast.loading('Creating campaign...', { id: 'create-campaign' });
      
      await tx.wait();
      toast.success('Campaign created successfully!', { id: 'create-campaign' });
      setStudentName('');
      setReason('');
      setGoal('');
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign', { id: 'create-campaign' });
    } finally {
      setLoading(false);
    }
  };

  const donate = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!campaignId.trim() || !donationAmount.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const amountInWei = parseEther(donationAmount);
      setLoading(true);

      const contract = getContract(EDU_FUND_ADDRESS, EDU_FUND_ABI);
      if (!contract) return;

      const tx = await contract.donate(parseInt(campaignId), { value: amountInWei });
      toast.loading('Processing donation...', { id: 'donate' });
      
      await tx.wait();
      toast.success(`Donated ${donationAmount} ETH successfully!`, { id: 'donate' });
      setDonationAmount('');
    } catch (error: any) {
      console.error('Error donating:', error);
      toast.error('Failed to process donation', { id: 'donate' });
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!campaignId.trim()) {
      toast.error('Please enter a campaign ID');
      return;
    }

    setLoading(true);
    try {
      const contract = getContract(EDU_FUND_ADDRESS, EDU_FUND_ABI);
      if (!contract) return;

      const tx = await contract.withdraw(parseInt(campaignId));
      toast.loading('Processing withdrawal...', { id: 'withdraw' });
      
      await tx.wait();
      toast.success('Funds withdrawn successfully!', { id: 'withdraw' });
    } catch (error: any) {
      console.error('Error withdrawing:', error);
      toast.error('Failed to withdraw funds', { id: 'withdraw' });
    } finally {
      setLoading(false);
    }
  };

  const viewCampaign = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!searchCampaignId.trim()) {
      toast.error('Please enter a campaign ID');
      return;
    }

    setLoading(true);
    try {
      const contract = getContract(EDU_FUND_ADDRESS, EDU_FUND_ABI);
      if (!contract) return;

      const campaignData = await contract.getCampaign(parseInt(searchCampaignId));
      setCampaign({
        owner: campaignData[0],
        studentName: campaignData[1],
        reason: campaignData[2],
        goal: campaignData[3],
        raised: campaignData[4],
        withdrawn: campaignData[5],
      });
      toast.success('Campaign details loaded');
    } catch (error: any) {
      console.error('Error fetching campaign:', error);
      toast.error('Failed to fetch campaign details');
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (raised: bigint, goal: bigint): number => {
    if (goal === 0n) return 0;
    return Math.min(Number((raised * 100n) / goal), 100);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <GraduationCap className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">EduFund</h2>
        <p className="text-gray-600">Education crowdfunding platform</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Create Campaign */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-blue-500" />
            Create Campaign
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <textarea
              placeholder="Reason for fundraising"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Goal (ETH)"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={createCampaign}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 rounded-lg transition-colors font-medium"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </div>

        {/* Donate */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-500" />
            Donate to Campaign
          </h3>
          <div className="space-y-4">
            <input
              type="number"
              placeholder="Campaign ID"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Amount (ETH)"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={donate}
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-3 rounded-lg transition-colors font-medium"
            >
              {loading ? 'Donating...' : 'Donate'}
            </button>
          </div>
        </div>

        {/* Withdraw */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Wallet className="h-5 w-5 mr-2 text-green-500" />
            Withdraw Funds
          </h3>
          <div className="space-y-4">
            <input
              type="number"
              placeholder="Campaign ID"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={withdraw}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-lg transition-colors font-medium"
            >
              {loading ? 'Withdrawing...' : 'Withdraw'}
            </button>
          </div>
        </div>

        {/* View Campaign */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2 text-purple-500" />
            View Campaign
          </h3>
          <div className="flex space-x-4 mb-4">
            <input
              type="number"
              placeholder="Campaign ID"
              value={searchCampaignId}
              onChange={(e) => setSearchCampaignId(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={viewCampaign}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              {loading ? 'Loading...' : 'View'}
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Details */}
      {campaign && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-500" />
            Campaign Details
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                <p className="text-lg font-semibold text-gray-900">{campaign.studentName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Address</label>
                <p className="text-sm font-mono text-gray-600">
                  {campaign.owner ? `${campaign.owner.slice(0, 6)}...${campaign.owner.slice(-4)}` : "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <p className="text-gray-800">{campaign.reason}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
                <p className="text-lg font-semibold text-gray-900">{formatEther(campaign.goal)} ETH</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raised</label>
                <p className="text-lg font-semibold text-green-600">{formatEther(campaign.raised)} ETH</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress</label>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(campaign.raised, campaign.goal)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {getProgressPercentage(campaign.raised, campaign.goal).toFixed(1)}% of goal reached
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  campaign.withdrawn 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {campaign.withdrawn ? 'Withdrawn' : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}