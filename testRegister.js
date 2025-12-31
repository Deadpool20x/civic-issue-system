import fetch from "node-fetch";

async function registerUser() {
  const url = "http://localhost:3000/api/auth/register";
  const data = {
    name: "Test User",
    email: "testuser@example.com",
    password: "TestPass123",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed with ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("Response:", result);
  } catch (error) {
    console.error("Error registering user:", error.message);
  }
}

registerUser();
