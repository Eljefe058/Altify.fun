import {Connection, PublicKey, Transaction, SystemProgram, clusterApiUrl} from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {AnchorProvider, Program, utils} from "@project-serum/anchor";
import idl from "../../programs/degen-token/src/idl (3).json";

// Initialize connection to the Solana blockchain
// const connection = new Connection('https://api.mainnet-beta.solana.com');



// Function to fetch token data from the smart contract
async function fetchTokenData() {
    // Fetch token accounts associated with the program (smart contract)
    const accounts = await connection.getProgramAccounts(programId);
    return accounts.map(account => {
        const tokenInfo = account.account.data; // Assuming the account.data contains serialized token info
        return {
            name: tokenInfo.name,
            price: tokenInfo.price,
            address: account.pubkey.toBase58(),
            priceHistory: tokenInfo.priceHistory
        };
    });
}



// Function to display safe tokens in the marketplace
async function displaySafeTokens() {
    // Fetch token data from the blockchain
    const tokenData = await fetchTokenData();

    // Display token data in the UI
    tokenData.forEach(token => {
        const tokenElement = document.createElement('div');
        tokenElement.innerHTML = `
      <h3>${token.name}</h3>
      <p>Price: ${token.price}</p>
      <button onclick="openTokenDashboard('${token.address}')">Trade</button>
    `;
        document.getElementById('marketplace').appendChild(tokenElement);
    });
}

// Function to open the token dashboard
function openTokenDashboard(tokenAddress) {
    // Fetch token details and display price chart and buy/sell buttons
    const tokenDetails = fetchTokenDetails(tokenAddress);
    document.getElementById('dashboard').innerHTML = `
    <h3>${tokenDetails.name}</h3>
    <p>Price: ${tokenDetails.price}</p>
    <canvas id="priceChart"></canvas>
    <button onclick="buyToken('${tokenAddress}')">Buy</button>
    <button onclick="sellToken('${tokenAddress}')">Sell</button>
  `;
    // Display price chart
    displayPriceChart(tokenDetails.priceHistory);
}

// Function to display price chart
function displayPriceChart(priceHistory) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: priceHistory.map((_, index) => `Day ${index + 1}`),
            datasets: [{
                label: 'Price History',
                data: priceHistory,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to buy a token
async function buyToken(tokenAddress) {
    const publicKey = new PublicKey(tokenAddress);
    const transaction = new Transaction().add(
        // Call the smart contract's buy method
        SystemProgram.invoke(
            {
                programId: programId,
                keys: [
                    { pubkey: yourPublicKey, isSigner: true, isWritable: true },
                    { pubkey: publicKey, isSigner: false, isWritable: true }
                ],
                data: Buffer.from([/* data for buy method */])
            }
        )
    );
    await connection.sendTransaction(transaction, [yourKeypair]);
}

// Function to sell a token
async function sellToken(tokenAddress) {
    const publicKey = new PublicKey(tokenAddress);
    const transaction = new Transaction().add(
        // Call the smart contract's sell method
        SystemProgram.invoke(
            {
                programId: programId,
                keys: [
                    { pubkey: publicKey, isSigner: false, isWritable: true },
                    { pubkey: yourPublicKey, isSigner: true, isWritable: true }
                ],
                data: Buffer.from([/* data for sell method */])
            }
        )
    );
    await connection.sendTransaction(transaction, [yourKeypair]);
}

// Initialize the marketplace
displaySafeTokens();