# How to Add SSH Key to GitHub

## Step 1: Display Your SSH Public Key

Open Terminal and run:
```bash
cat ~/.ssh/id_ed25519.pub
```

This will display a line starting with `ssh-ed25519` followed by a long string of characters. **Copy the entire line**.

## Step 2: Add SSH Key to GitHub

1. Go to [GitHub.com](https://github.com) and log in to your account
2. Click your profile picture in the top-right corner → **Settings**
3. In the left sidebar, click **SSH and GPG keys**
4. Click the green **New SSH key** button
5. Fill in:
   - **Title**: Something descriptive like "MacBook Pro" or "Work Laptop"
   - **Key type**: Authentication Key
   - **Key**: Paste the SSH public key you copied in Step 1
6. Click **Add SSH key**
7. Enter your GitHub password if prompted

## Step 3: Verify SSH Connection

After adding the key, verify the connection by running:
```bash
ssh -T git@github.com
```

You should see a message like:
```
Hi username! You've successfully authenticated, but GitHub does not provide shell access.
```

## Step 4: Continue with Deployment

Once SSH is verified, run these commands in your project directory:
```bash
cd /Users/chandangaur/development/Nest\ JS/new-nestjs-gym-app

# Create GitHub repository (or create it on GitHub.com)
# Then add remote and push:
git remote add origin git@github.com:yourusername/new-nestjs-gym-app.git
git branch -M main
git push -u origin main
```
