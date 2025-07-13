import React, { useState } from 'react';
import { Package, Plus, Search, Clock, User } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { formatEther } from 'ethers';
import toast from 'react-hot-toast';

// You'll need to replace this with your actual contract ABI
const SUPPLY_TRUST_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_productId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			}
		],
		"name": "addStage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_productId",
				"type": "string"
			}
		],
		"name": "createProduct",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "productId",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			}
		],
		"name": "ProductCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "productId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "handler",
				"type": "address"
			}
		],
		"name": "StageAdded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_productId",
				"type": "string"
			}
		],
		"name": "getProductStages",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			},
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const SUPPLY_TRUST_ADDRESS = "0xA760C70B25af76414C974A6BA47a99c36007aa4B"; // Replace with your deployed contract address

interface Stage {
  description: string;
  handler: string;
  timestamp: bigint;
}

export function SupplyTrust() {
  const { getContract, isConnected } = useWeb3();
  const [productId, setProductId] = useState('');
  const [stageDescription, setStageDescription] = useState('');
  const [searchProductId, setSearchProductId] = useState('');
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(false);

  const createProduct = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!productId.trim()) {
      toast.error('Please enter a product ID');
      return;
    }

    setLoading(true);
    try {
      const contract = getContract(SUPPLY_TRUST_ADDRESS, SUPPLY_TRUST_ABI);
      if (!contract) return;

      const tx = await contract.createProduct(productId);
      toast.loading('Creating product...', { id: 'create-product' });
      
      await tx.wait();
      toast.success('Product created successfully!', { id: 'create-product' });
      setProductId('');
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product', { id: 'create-product' });
    } finally {
      setLoading(false);
    }
  };

  const addStage = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!productId.trim() || !stageDescription.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const contract = getContract(SUPPLY_TRUST_ADDRESS, SUPPLY_TRUST_ABI);
      if (!contract) return;

      const tx = await contract.addStage(productId, stageDescription);
      toast.loading('Adding stage...', { id: 'add-stage' });
      
      await tx.wait();
      toast.success('Stage added successfully!', { id: 'add-stage' });
      setStageDescription('');
    } catch (error: any) {
      console.error('Error adding stage:', error);
      toast.error('Failed to add stage', { id: 'add-stage' });
    } finally {
      setLoading(false);
    }
  };

  const viewProductStages = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!searchProductId.trim()) {
      toast.error('Please enter a product ID to search');
      return;
    }

    setLoading(true);
    try {
      const contract = getContract(SUPPLY_TRUST_ADDRESS, SUPPLY_TRUST_ABI);
      if (!contract) return;

      const productStages = await contract.getProductStages(searchProductId);
      setStages(productStages);
      
      if (productStages.length === 0) {
        toast.info('No stages found for this product');
      } else {
        toast.success(`Found ${productStages.length} stages`);
      }
    } catch (error: any) {
      console.error('Error fetching stages:', error);
      toast.error('Failed to fetch product stages');
      setStages([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Package className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">SupplyTrust</h2>
        <p className="text-gray-600">Track your product supply chain</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Create Product */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-green-500" />
            Create New Product
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Product ID"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={createProduct}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 rounded-lg transition-colors font-medium"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </div>

        {/* Add Stage */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-orange-500" />
            Add Supply Chain Stage
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Product ID"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Stage Description"
              value={stageDescription}
              onChange={(e) => setStageDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={addStage}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 rounded-lg transition-colors font-medium"
            >
              {loading ? 'Adding...' : 'Add Stage'}
            </button>
          </div>
        </div>
      </div>

      {/* View Product Stages */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Search className="h-5 w-5 mr-2 text-purple-500" />
          View Product Stages
        </h3>
        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            placeholder="Product ID to search"
            value={searchProductId}
            onChange={(e) => setSearchProductId(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={viewProductStages}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {stages.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">
                    <Clock className="h-4 w-4 inline mr-2" />
                    Stage
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">
                    <User className="h-4 w-4 inline mr-2" />
                    Handler
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">
                    <Clock className="h-4 w-4 inline mr-2" />
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {stages.map((stage, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">{stage.description}</td>
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">
                      {stage.handler ? `${stage.handler.slice(0, 6)}...${stage.handler.slice(-4)}` : "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      {formatTimestamp(stage.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}