#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting MMP deployment..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build

# Build and deploy Solana programs
echo "🔨 Building Solana programs..."
cd ../backend
anchor build

echo "📤 Deploying to devnet..."
anchor deploy --provider.cluster devnet

# Get program IDs
TOKEN_PROGRAM_ID=$(solana address -k target/deploy/mmp_token-keypair.json)
GOVERNANCE_PROGRAM_ID=$(solana address -k target/deploy/mmp_governance-keypair.json)
DATA_ACCESS_PROGRAM_ID=$(solana address -k target/deploy/mmp_data_access-keypair.json)

echo "✅ Deployment complete!"
echo "Program IDs:"
echo "Token Program: $TOKEN_PROGRAM_ID"
echo "Governance Program: $GOVERNANCE_PROGRAM_ID"
echo "Data Access Program: $DATA_ACCESS_PROGRAM_ID"

# Update frontend configuration with new program IDs
echo "🔄 Updating frontend configuration..."
cd ../frontend
sed -i "s/MMP111111111111111111111111111111111111111/$TOKEN_PROGRAM_ID/g" src/config.ts
sed -i "s/MMPG111111111111111111111111111111111111111/$GOVERNANCE_PROGRAM_ID/g" src/config.ts
sed -i "s/MMPA111111111111111111111111111111111111111/$DATA_ACCESS_PROGRAM_ID/g" src/config.ts

echo "🎉 Deployment finished successfully!" 