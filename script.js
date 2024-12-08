let tlsnClient = null;

// Function: Update Output
function updateOutput(message, isError = false) {
  const output = document.getElementById('output');
  output.innerText = message;
  output.style.color = isError ? 'red' : 'white';
}

// Button: Connect to TLSN
document.getElementById('connect-btn').addEventListener('click', async () => {
  updateOutput('Connecting to TLSN...');
  
  const maxAttempts = 500;

  // Retry connection attempts
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      tlsnClient = await tlsn.connect(); // Attempt connection to TLSN
      updateOutput('Connected to TLSN successfully!');
      return; // Exit the loop on successful connection
    } catch (error) {
      if (attempt < maxAttempts) {
        updateOutput(`Retrying to connect to TLSN... (Attempt ${attempt}/${maxAttempts})`);
      } else {
        updateOutput(`Error connecting to TLSN after ${maxAttempts} attempts: ${error.message}`, true);
      }
    }
  }
});

// Button: Get Attestation History
document.getElementById('history-btn').addEventListener('click', async () => {
  if (!tlsnClient) {
    updateOutput('Please connect to TLSN first!', true);
    return;
  }
  updateOutput('Fetching attestation history...');
  try {
    const history = await tlsnClient.getHistory('*', '**', {});
    if (history.length > 0) {
      updateOutput(JSON.stringify(history, null, 2));
    } else {
      updateOutput('No attestations found.');
    }
  } catch (error) {
    updateOutput(`Error fetching history: ${error.message}`, true);
  }
});

// Button: Notarize Request
document.getElementById('notarize-btn').addEventListener('click', async () => {
  if (!tlsnClient) {
    updateOutput('Please connect to TLSN first!', true);
    return;
  }
  const nftId = 'NFT123456789';
  const walletId = 'WALLET987654321';
  updateOutput('Notarizing request...');
  try {
    const proof = await tlsnClient.notarize(
      'https://jsonplaceholder.typicode.com/posts',
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      },
      {
        metadata: { id: 'demo-notarize', nftId: nftId, walletId: walletId },
      }
    );
    updateOutput(`Notarization successful: ${JSON.stringify(proof, null, 2)}`);
  } catch (error) {
    updateOutput(`Error notarizing request: ${error.message}`, true);
  }
});

// Button: Verify Request
document.getElementById('verify-btn').addEventListener('click', () => {
  const nftIdToVerify = 'NFT123456789';
  const walletIdToVerify = 'WALLET987654321';
  const proofText = document.getElementById('output').innerText;

  try {
    const proof = JSON.parse(proofText);
    if (
      proof.metadata.nftId === nftIdToVerify &&
      proof.metadata.walletId === walletIdToVerify
    ) {
      updateOutput(
        `Verification successful: NFT ID ${nftIdToVerify} belongs to Wallet ID ${walletIdToVerify}.`
      );
    } else {
      updateOutput(`Verification failed: Ownership does not match!`, true);
    }
  } catch (error) {
    updateOutput('Invalid proof format or no proof available!', true);
  }
});
