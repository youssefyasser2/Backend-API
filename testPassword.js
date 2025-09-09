// const bcrypt = require('bcrypt');

// // Function to generate hash and verify password
// async function handlePassword(inputPassword, storedPasswordHash = null) {
//   const saltRounds = 10;

//   // If no stored hash is provided, generate a new hash for the input password
//   if (!storedPasswordHash) {
//     const hashedPassword = await bcrypt.hash(inputPassword, saltRounds);
//     console.log("Generated Hash:", hashedPassword);

//     // Return the generated hash for future comparisons if needed
//     return hashedPassword;
//   }

//   // If a stored hash is provided, compare it with the input password
//   const match = await bcrypt.compare(inputPassword, storedPasswordHash);
//   if (match) {
//     console.log('Password match: Success! The password is correct.');
//   } else {
//     console.log('Password match: Failure. The password does not match.');
//   }
// }

// // Example usage:
// (async () => {
//   // Generate hash for 'password123'
//   const generatedHash = await handlePassword('password123');
  
//   // Verify 'password123' against the generated hash
//   await handlePassword('password123', generatedHash);  // Should log: Password match: Success! The password is correct.
  
//   // Verify incorrect password
//   await handlePassword('wrongpassword', generatedHash);  // Should log: Password match: Failure. The password does not match.
// })();


const bcrypt = require("bcrypt");

const enteredPassword = "Password123!"; // كلمة المرور التي تدخلها أثناء تسجيل الدخول
const hashedPasswordFromDB = "$2b$12$nTfttK4cf1dTkxMMvgMAPea/IeIScA.NuWSPRC5AlwQ8aKpzhcXYW"; // كلمة المرور المخزنة

bcrypt.compare(enteredPassword, hashedPasswordFromDB).then((match) => {
  console.log("✅ Password Match:", match);
});
