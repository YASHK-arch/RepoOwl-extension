import _sodium from 'libsodium-wrappers';

// Base64 encoded file contents to avoid JS parser string termination issues
const WORKFLOW_YAML_B64 = "bmFtZTogUmVwb093bCBQUiBBbmFseXplcgoKb246CiAgcHVsbF9yZXF1ZXN0OgogICAgdHlwZXM6IFtvcGVuZWQsIHJlYWR5X2Zvcl9yZXZpZXddCiAgaXNzdWVfY29tbWVudDoKICAgIHR5cGVzOiBbY3JlYXRlZF0KCnBlcm1pc3Npb25zOgogIHB1bGwtcmVxdWVzdHM6IHdyaXRlCiAgaXNzdWVzOiB3cml0ZQogIGNvbnRlbnRzOiB3cml0ZQoKam9iczoKICBhbmFseXplLXByOgogICAgIyBPbmx5IHJ1biBpZiBpdCdzIGEgUFIgY3JlYXRpb24gT1IgaWYgdGhlIGNvbW1lbnQgY29udGFpbnMgZXhhY3RseSAiL2FuYWx5emUiIChvciAiL2FuYWx5c2UiKQogICAgaWY6ID4KICAgICAgZ2l0aHViLmV2ZW50X25hbWUgPT0gJ3B1bGxfcmVxdWVzdCcgfHwKICAgICAgKGdpdGh1Yi5ldmVudC5pc3N1ZS5wdWxsX3JlcXVlc3QgJiYgKGNvbnRhaW5zKGdpdGh1Yi5ldmVudC5jb21tZW50LmJvZHksICcvYW5hbHl6ZScpIHx8IGNvbnRhaW5zKGdpdGh1Yi5ldmVudC5jb21tZW50LmJvZHksICcvYW5hbHlzZScpKSkKCiAgICBydW5zLW9uOiB1YnVudHUtbGF0ZXN0CgogICAgc3RlcHM6CiAgICAgIC0gbmFtZTogQ2hlY2tvdXQgUmVwb3NpdG9yeQogICAgICAgIHVzZXM6IGFjdGlvbnMvY2hlY2tvdXRAdjQKCiAgICAgIC0gbmFtZTogU2V0dXAgTm9kZS5qcwogICAgICAgIHVzZXM6IGFjdGlvbnMvc2V0dXAtbm9kZUB2NAogICAgICAgIHdpdGg6CiAgICAgICAgICBub2RlLXZlcnNpb246ICcyMCcKCgogICAgICAtIG5hbWU6IFJ1biBSZXBvT3dsIFBSIEFuYWx5c2lzCiAgICAgICAgZW52OgogICAgICAgICAgR1JPUV9BUElfS0VZOiAke3sgc2VjcmV0cy5HUk9RX0FQSV9LRVkgfX0KICAgICAgICAgIEdJVEhVQl9UT0tFTjogJHt7IHNlY3JldHMuR0lUSFVCX1RPS0VOIH19CiAgICAgICAgICBQUl9OVU1CRVI6ICR7eyBnaXRodWIuZXZlbnQucHVsbF9yZXF1ZXN0Lm51bWJlciB8fCBnaXRodWIuZXZlbnQuaXNzdWUubnVtYmVyIH19CiAgICAgICAgICBSRVBPU0lUT1JZOiAke3sgZ2l0aHViLnJlcG9zaXRvcnkgfX0KICAgICAgICBydW46IG5vZGUgLmdpdGh1Yi9zY3JpcHRzL2FuYWx5emUtcHIuanM=";
const SCRIPT_JS_B64 = "Cgpjb25zdCBHUk9RX0FQSV9LRVkgPSBwcm9jZXNzLmVudi5HUk9RX0FQSV9LRVk7CmNvbnN0IEdJVEhVQl9UT0tFTiA9IHByb2Nlc3MuZW52LkdJVEhVQl9UT0tFTjsKY29uc3QgUFJfTlVNQkVSID0gcHJvY2Vzcy5lbnYuUFJfTlVNQkVSOwpjb25zdCBSRVBPU0lUT1JZID0gcHJvY2Vzcy5lbnYuUkVQT1NJVE9SWTsgLy8gZm9ybWF0OiBvd25lci9yZXBvCgpjb25zdCBHUk9RX1VSTCA9ICdodHRwczovL2FwaS5ncm9xLmNvbS9vcGVuYWkvdjEvY2hhdC9jb21wbGV0aW9ucyc7CmNvbnN0IE1PREVMX05BTUUgPSAnbGxhbWEtMy4zLTcwYi12ZXJzYXRpbGUnOwoKYXN5bmMgZnVuY3Rpb24gYXNrR3JvcShwcm9tcHQpIHsKICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKEdST1FfVVJMLCB7CiAgICBtZXRob2Q6ICdQT1NUJywKICAgIGhlYWRlcnM6IHsKICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7R1JPUV9BUElfS0VZfWAsCiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicKICAgIH0sCiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7CiAgICAgIG1vZGVsOiBNT0RFTF9OQU1FLAogICAgICBtZXNzYWdlczogW3sgcm9sZTogInVzZXIiLCBjb250ZW50OiBwcm9tcHQgfV0KICAgIH0pCiAgfSk7CiAgaWYgKCFyZXNwb25zZS5vaykgewogICAgY29uc3QgZXJyb3JUZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpOwogICAgdGhyb3cgbmV3IEVycm9yKGBHcm9xIEFQSSBlcnJvcjogJHtlcnJvclRleHR9YCk7CiAgfQogIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7CiAgcmV0dXJuIGRhdGEuY2hvaWNlc1swXS5tZXNzYWdlLmNvbnRlbnQ7Cn0KCmFzeW5jIGZ1bmN0aW9uIHJ1bigpIHsKICBpZiAoIUdST1FfQVBJX0tFWSB8fCAhR0lUSFVCX1RPS0VOKSB7CiAgICBjb25zb2xlLmVycm9yKCJNaXNzaW5nIEdST1FfQVBJX0tFWSBvciBHSVRIVUJfVE9LRU4gc2VjcmV0LiIpOwogICAgcHJvY2Vzcy5leGl0KDEpOwogIH0KCiAgY29uc29sZS5sb2coYFN0YXJ0aW5nIFJlcG9Pd2wgTWFwLVJlZHVjZSBBbmFseXNpcyBmb3IgUFIgIyR7UFJfTlVNQkVSfSBpbiAke1JFUE9TSVRPUll9Li4uYCk7CgogIC8vIDEuIEZldGNoIFBSIERldGFpbHMKICBjb25zdCBwclJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vcmVwb3MvJHtSRVBPU0lUT1JZfS9wdWxscy8ke1BSX05VTUJFUn1gLCB7CiAgICBoZWFkZXJzOiB7ICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke0dJVEhVQl9UT0tFTn1gIH0KICB9KTsKICBjb25zdCBwckRhdGEgPSBhd2FpdCBwclJlc3BvbnNlLmpzb24oKTsKCiAgLy8gMi4gRmV0Y2ggUFIgRGlmZnMKICBjb25zdCBkaWZmUmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy8ke1JFUE9TSVRPUll9L3B1bGxzLyR7UFJfTlVNQkVSfS9maWxlc2AsIHsKICAgIGhlYWRlcnM6IHsgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7R0lUSFVCX1RPS0VOfWAgfQogIH0pOwogIGNvbnN0IGZpbGVzRGF0YSA9IGF3YWl0IGRpZmZSZXNwb25zZS5qc29uKCk7CgogIC8vIDMuIENoZWNrIGZvciBMaW5rZWQgSXNzdWVzCiAgbGV0IGxpbmtlZElzc3VlQ29udGV4dCA9ICJObyBsaW5rZWQgaXNzdWUgZGV0ZWN0ZWQuIjsKICBjb25zdCBpc3N1ZU1hdGNoID0gcHJEYXRhLmJvZHkgPyBwckRhdGEuYm9keS5tYXRjaCgvKD86Zml4fGZpeGVzfHJlc29sdmVzfGNsb3NlcylccysjKFxkKykvaSkgOiBudWxsOwogIAogIGlmIChpc3N1ZU1hdGNoKSB7CiAgICBjb25zdCBpc3N1ZU51bSA9IGlzc3VlTWF0Y2hbMV07CiAgICBjb25zb2xlLmxvZyhgRGV0ZWN0ZWQgbGlua2VkIGlzc3VlICMke2lzc3VlTnVtfS4gRmV0Y2hpbmcgY29udGV4dC4uLmApOwogICAgY29uc3QgaXNzdWVSZXMgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy8ke1JFUE9TSVRPUll9L2lzc3Vlcy8ke2lzc3VlTnVtfWAsIHsKICAgICAgaGVhZGVyczogeyAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHtHSVRIVUJfVE9LRU59YCB9CiAgICB9KTsKICAgIGlmIChpc3N1ZVJlcy5vaykgewogICAgICBjb25zdCBpc3N1ZURldGFpbHMgPSBhd2FpdCBpc3N1ZVJlcy5qc29uKCk7CiAgICAgIGxpbmtlZElzc3VlQ29udGV4dCA9IGBMaW5rZWQgSXNzdWUgR29hbDogJHtpc3N1ZURldGFpbHMudGl0bGV9XG4ke2lzc3VlRGV0YWlscy5ib2R5fWA7CiAgICB9CiAgfQoKICAvLyA0LiBNQVAgUEhBU0U6IFN1bW1hcml6ZSBpbmRpdmlkdWFsIGZpbGVzCiAgY29uc3QgZmlsdGVyZWRGaWxlcyA9IGZpbGVzRGF0YS5maWx0ZXIoZiA9PiAKICAgICFmLmZpbGVuYW1lLmluY2x1ZGVzKCdwYWNrYWdlLWxvY2suanNvbicpICYmIAogICAgIWYuZmlsZW5hbWUuZW5kc1dpdGgoJy5zdmcnKSAmJgogICAgZi5wYXRjaAogICk7CgogIGNvbnNvbGUubG9nKGBNYXBwaW5nICR7ZmlsdGVyZWRGaWxlcy5sZW5ndGh9IGZpbGVzLi4uYCk7CiAgY29uc3QgZmlsZVN1bW1hcmllcyA9IFtdOwogIAogIGZvciAoY29uc3QgZmlsZSBvZiBmaWx0ZXJlZEZpbGVzKSB7CiAgICB0cnkgewogICAgICBjb25zb2xlLmxvZyhgU3VtbWFyaXppbmcgJHtmaWxlLmZpbGVuYW1lfS4uLmApOwogICAgICBjb25zdCBtYXBQcm9tcHQgPSBgCiAgICAgICAgQnJpZWZseSBzdW1tYXJpemUgd2hhdCB0aGlzIHNwZWNpZmljIGZpbGUgZGlmZiBkb2VzIGluIDIgc2VudGVuY2VzIG1heC4KICAgICAgICBGaWxlOiAke2ZpbGUuZmlsZW5hbWV9CiAgICAgICAgU3RhdHVzOiAke2ZpbGUuc3RhdHVzfQogICAgICAgIFBhdGNoOgogICAgICAgICR7ZmlsZS5wYXRjaC5zdWJzdHJpbmcoMCwgMTAwMDApfQogICAgICBgOwogICAgICBjb25zdCBzdW1tYXJ5ID0gYXdhaXQgYXNrR3JvcShtYXBQcm9tcHQpOwogICAgICBmaWxlU3VtbWFyaWVzLnB1c2goYC0gKioke2ZpbGUuZmlsZW5hbWV9Kio6ICR7c3VtbWFyeX1gKTsKICAgICAgLy8gU2ltcGxlIGRlbGF5IHRvIGF2b2lkIHJhdGUgbGltaXRzCiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDAwKSk7CiAgICB9IGNhdGNoIChlcnIpIHsKICAgICAgY29uc29sZS53YXJuKGBDb3VsZCBub3Qgc3VtbWFyaXplICR7ZmlsZS5maWxlbmFtZX06YCwgZXJyLm1lc3NhZ2UpOwogICAgfQogIH0KCiAgLy8gNS4gUkVEVUNFIFBIQVNFOiBGaW5hbCBBbmFseXNpcwogIGNvbnNvbGUubG9nKCJSZWR1Y2luZyBzdW1tYXJpZXMgaW50byBmaW5hbCBhbmFseXNpcy4uLiIpOwogIGNvbnN0IHJlZHVjZVByb21wdCA9IGAKICAgIFlvdSBhcmUgYW4gZXhwZXJ0LCBydXRobGVzcyBBSSBDb2RlIFJldmlld2VyIGZvciBSZXBvT3dsLgogICAgCiAgICBQUiBUaXRsZTogJHtwckRhdGEudGl0bGV9CiAgICBQUiBEZXNjcmlwdGlvbjogJHtwckRhdGEuYm9keSB8fCAiTm9uZSBwcm92aWRlZC4ifQogICAgCiAgICAke2xpbmtlZElzc3VlQ29udGV4dH0KICAgIAogICAgQ29kZSBDaGFuZ2VzIFN1bW1hcmllcyAoTWFwIFBoYXNlKToKICAgICR7ZmlsZVN1bW1hcmllcy5sZW5ndGggPiAwID8gZmlsZVN1bW1hcmllcy5qb2luKCdcbicpIDogIk5vIHNpZ25pZmljYW50IGNvZGUgY2hhbmdlcyBmb3VuZC4ifQogICAgCiAgICBBbmFseXplIHRoZSBQUiBhbmQgb3V0cHV0IHlvdXIgcmVzcG9uc2UgaW4gTWFya2Rvd24gZm9ybWF0LiBZb3VyIHJlc3BvbnNlIE1VU1QgaW5jbHVkZSB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZWQgc2VjdGlvbnM6CiAgICAKICAgIDEuICoqU2xvcCBCYWRnZSoqOiBPdXRwdXQgZXhhY3RseSBvbmUgb2YgdGhlc2UgdHdvIHBocmFzZXMgYXQgdGhlIHZlcnkgYmVnaW5uaW5nIGJhc2VkIG9uIGlmIHRoZSBjb2RlIGdlbnVpbmVseSBtYXRjaGVzIHRoZSBQUiBkZXNjcmlwdGlvbjoKICAgICAgICLwn5+iIFtDb2RlIE1hdGNoZXMgRGVzY3JpcHRpb25dIiBvciAi8J+UtCBb4pqg77iPIEFJIFNsb3AgRGV0ZWN0ZWRdIgogICAgMi4gKipBSSBTbG9wIERldGVjdGlvbioqOiBFeHBsYWluIHlvdXIgcmVhc29uaW5nIGZvciB0aGUgYmFkZ2UuIElzIHRoZSBkZXNjcmlwdGlvbiBoYWxsdWNpbmF0ZWQvaW5hY2N1cmF0ZT8KICAgIDMuICoqSXNzdWUgUmVzb2x1dGlvbioqOiBEb2VzIHRoZSBjb2RlIGFjdHVhbGx5IHNvbHZlIHRoZSBsaW5rZWQgaXNzdWU/CiAgICA0LiAqKkRvbWFpbiBJbXBhY3QqKjogQSBicmllZiBidWxsZXRlZCBsaXN0IG9mIHdoaWNoIGNvbXBvbmVudHMvZG9tYWlucyB3ZXJlIHRvdWNoZWQgKGUuZy4sIEZyb250ZW5kLCBEYXRhYmFzZSkuCiAgICA1LiAqKkJyZWFraW5nIENoYW5nZXMqKjogQXJlIHRoZXJlIGFueT8KICAgIDYuICoqRmluYWwgVmVyZGljdCoqOiBBcHByb3ZlIG9yIFJlcXVlc3QgQ2hhbmdlcyBiYXNlZCBvbiBjb2RlIHF1YWxpdHkgYW5kIGFjY3VyYWN5LgogIGA7CgogIGNvbnN0IGFuYWx5c2lzT3V0cHV0ID0gYXdhaXQgYXNrR3JvcShyZWR1Y2VQcm9tcHQpOwoKICAvLyA2LiBQb3N0IHRoZSBDb21tZW50IGJhY2cyB0byBHaXRIdWIKICBjb25zb2xlLmxvZygiUG9zdGluZyBjb21tZW50IHRvIEdpdEh1Yi4uLiIpOwogIGNvbnN0IGNvbW1lbnRCb2R5ID0gYCMjIyDwn6aJIFJlcG9Pd2wgUFIgQW5hbHlzaXNcblxuJHthbmFseXNpc091dHB1dH1cblxuKkFuYWx5emVkIGF1dG9tYXRpY2FsbHkgdmlhIEdpdEh1YiBBY3Rpb25zKmBwOwKCiAgYXdhaXQgZmV0Y2goYGh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vcmVwb3MvJHtSRVBPU0lUT1JZfS9pc3N1ZXMvJHtQUl9OVU1CRVJ9L2NvbW1lbnRzYCwgewogICAgbWV0aG9kOiAnUE9TVCcsCiAgICBoZWFkZXJzOiB7CiAgICAgICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke0dJVEhVQl9UT0tFTn1gLAogICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nCiAgICB9LAogICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBib2R5OiBjb21tZW50Qm9keSB9KQogIH0pOwoKICBjb25zb2xlLmxvZygiQW5hbHlzaXMgcG9zdGVkIHN1Y2Nlc3NmdWxseSEiKTsKfQoKcnVuKCkuY2F0Y2goZXJyID0+IHsKICBjb25zb2xlLmVycm9yKCJXb3JrZmxvdyBmYWlsZWQ6IiwgZXJyKTsKICBwcm9jZXNzLmV4aXQoMSk7Cn0pOwo=";

const WORKFLOW_YAML = atob(WORKFLOW_YAML_B64);
const SCRIPT_JS = atob(SCRIPT_JS_B64);

/**
 * Encrypt a secret using the repository's public key
 */
async function encryptSecret(secret, publicKeyBase64) {
  await _sodium.ready;
  const sodium = _sodium;
  const binkey = sodium.from_base64(publicKeyBase64, sodium.base64_variants.ORIGINAL);
  const binsec = sodium.from_string(secret);
  const encBytes = sodium.crypto_box_seal(binsec, binkey);
  return sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);
}

/**
 * Authenticate via GitHub and return the token
 * We use the provided PAT for simplicity as an MVP before requiring an OAuth App Client ID.
 */
async function getGitHubToken(providedPat) {
  if (providedPat) return providedPat;
  throw new Error("No GitHub Personal Access Token provided. Please enter one.");
}

/**
 * 1. Pushes a file to the GitHub repository using the Contents API
 */
async function pushFile(token, owner, repo, path, contentStr, commitMessage) {
  const contentBase64 = btoa(unescape(encodeURIComponent(contentStr)));
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  // Check if file exists to get the SHA (required for updating)
  let sha;
  try {
    const res = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      sha = data.sha;
    }
  } catch (e) {
    // File doesn't exist, ignore
  }

  const payload = {
    message: commitMessage,
    content: contentBase64,
  };
  if (sha) payload.sha = sha;

  const pushRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!pushRes.ok) {
    const err = await pushRes.json();
    throw new Error(`Failed to push ${path}: ${err.message}`);
  }
}

/**
 * 2. Uploads the GROQ_API_KEY secret to the repository
 */
async function pushSecret(token, owner, repo, groqApiKey) {
  // Step A: Fetch the public key
  const keyRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!keyRes.ok) {
    const err = await keyRes.json();
    throw new Error(`Failed to fetch public key: ${err.message}`);
  }
  const keyData = await keyRes.json();
  const publicKeyId = keyData.key_id;
  const publicKey = keyData.key;

  // Step B: Encrypt the secret
  const encryptedValue = await encryptSecret(groqApiKey, publicKey);

  // Step C: Upload the secret
  const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/secrets/GROQ_API_KEY`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      encrypted_value: encryptedValue,
      key_id: publicKeyId
    })
  });

  if (!putRes.ok) {
    const err = await putRes.json();
    throw new Error(`Failed to upload secret: ${err.message}`);
  }
}

/**
 * Main initialization flow
 */
export async function initializeRepoOwl(repoFullName, githubPat, groqApiKey) {
  const [owner, repo] = repoFullName.split('/');
  
  if (!groqApiKey) {
    throw new Error("GROQ_API_KEY is not set in extension options.");
  }
  
  const token = await getGitHubToken(githubPat);

  // 1. Push Workflow
  await pushFile(token, owner, repo, '.github/workflows/repoowl-analyze.yml', WORKFLOW_YAML, 'Initialize RepoOwl PR Analyzer Action');
  
  // 2. Push Script
  await pushFile(token, owner, repo, '.github/scripts/analyze-pr.js', SCRIPT_JS, 'Add RepoOwl Map-Reduce script');

  // 3. Push Secret
  await pushSecret(token, owner, repo, groqApiKey);

  return true;
}
