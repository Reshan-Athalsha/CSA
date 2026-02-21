# Authentication Setup Instructions

## Step 1: Run the Authentication Schema

1. Open your Supabase project at https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `supabase-auth-schema.sql` in this project
5. Copy all the contents and paste it into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)

This will create:
- `user_profiles` table to track user approval status
- Trigger to automatically create a profile when a user signs up
- Row Level Security (RLS) policies

## Step 2: Sign Up Your Admin Account

1. Make sure your development server is running:
   ```powershell
   npm run dev
   ```

2. Open the app at http://localhost:5180/

3. Click **Sign Up** button

4. Fill in the form with your details:
   - Full Name: Your name
   - Email: **reshanathalsha36@gmail.com**
   - Password: **12345678**
   - Role: **Admin**

5. Click **Sign Up**

6. You'll see a message that your account is pending approval

## Step 3: Approve Your Admin Account

Since you're the first user, you need to manually approve yourself in Supabase:

1. Go to Supabase Dashboard → **Table Editor**
2. Select the **user_profiles** table
3. Find your row (reshanathalsha36@gmail.com)
4. Click to edit the row
5. Change **status** from `pending` to `approved`
6. Save the changes

**OR** run this SQL query in the SQL Editor:

```sql
UPDATE user_profiles 
SET status = 'approved', role = 'Admin'
WHERE email = 'reshanathalsha36@gmail.com';
```

## Step 4: Log In

1. Go back to the app
2. Click **Sign In**
3. Enter your credentials:
   - Email: reshanathalsha36@gmail.com
   - Password: 12345678
4. You should now be logged in as Admin!

## Managing User Approvals

Once you're logged in as Admin:

1. Navigate to **User Approval** page from the navigation
2. You'll see all pending user registrations
3. Click **Approve** to grant access or **Reject** to deny

## How It Works

### For New Users
1. User clicks **Sign Up** on the landing page
2. They fill in the registration form (email, password, name, role)
3. Their account is created with `status = 'pending'`
4. They cannot log in until an Admin approves them

### For Admins
1. Admin logs in
2. Goes to **User Approval** page
3. Reviews pending users
4. Approves or rejects each user
5. Approved users can now log in and access the system

### Access Control
- **Landing Page**: Public, anyone can access
- **Signup/Login Pages**: Public
- **Admin Pages** (Swimmers, Meets, Notices, etc.): Requires Admin role and approved status
- **Family Dashboard**: Requires Parent role and approved status
- **User Approval**: Admin only

## Troubleshooting

### "Access Denied" when trying to log in
- Check that your account status is `approved` in the `user_profiles` table
- Make sure you're using the correct email and password

### Can't see pending users in User Approval
- Make sure you're logged in as an Admin
- Check the `user_profiles` table to see if there are users with `status = 'pending'`

### "Your account is pending approval" message
- This is expected for new signups
- An admin needs to approve your account first
- If you're the first admin, follow Step 3 above to approve yourself

### Error loading user profile
- Make sure you ran the `supabase-auth-schema.sql` script
- Check that the `user_profiles` table exists in Supabase
- Check browser console for detailed error messages

## Next Steps

After setting up authentication:
1. Test the signup flow with a test user
2. Practice approving users through the User Approval page
3. Create some swimmers and start using the app!
