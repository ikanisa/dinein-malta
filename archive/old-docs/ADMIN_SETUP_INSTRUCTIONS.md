# Admin Setup Instructions

## Admin Email/Password Authentication

The Admin app now uses proper Supabase email/password authentication with admin user verification.

## How to Create an Admin User

### Step 1: Create Auth User in Supabase

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Go to **Authentication** > **Users**
4. Click **Add User** or **Invite User**
5. Enter the admin email (e.g., `admin@dinein.mt`)
6. Set a secure password
7. **Important**: Uncheck "Auto Confirm User" if you want to verify email first, or leave it checked to auto-confirm
8. Click **Create User**

### Step 2: Get the User UUID

1. After creating the user, find the user in the Users list
2. Click on the user to view details
3. Copy the **UUID** (it looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Step 3: Create Admin User Record

Run this SQL in the Supabase SQL Editor:

```sql
-- Option 1: Use the helper function (recommended)
SELECT create_admin_user('user-uuid-here');

-- Option 2: Manual insert
INSERT INTO public.admin_users (auth_user_id, role, is_active)
VALUES ('user-uuid-here', 'admin', true)
ON CONFLICT (auth_user_id) 
DO UPDATE SET is_active = true, updated_at = now();
```

Replace `'user-uuid-here'` with the actual UUID from Step 2.

### Step 4: Test Login

1. Go to: https://dinein-admin-423260854848.europe-west1.run.app/login
2. Enter the email and password you created
3. Click "Sign In"
4. You should be redirected to the dashboard

## Security Notes

- **Admin users** are stored in the `admin_users` table
- Only users with an entry in `admin_users` with `is_active = true` can access the admin panel
- All protected routes verify authentication and admin status
- Failed authentication or non-admin users are automatically signed out and redirected to login

## Deactivating an Admin User

To deactivate an admin user (without deleting):

```sql
UPDATE public.admin_users
SET is_active = false
WHERE auth_user_id = 'user-uuid-here';
```

## Reactivating an Admin User

```sql
UPDATE public.admin_users
SET is_active = true, updated_at = now()
WHERE auth_user_id = 'user-uuid-here';
```

## Troubleshooting

### "Access Denied: This email is not on the admin allowlist"

This means:
1. The email/password is correct (auth succeeded), BUT
2. The user is not in the `admin_users` table

**Solution**: Follow Step 3 above to add the user to `admin_users`.

### "Invalid email or password"

This means:
1. The user doesn't exist in Supabase Auth, OR
2. The password is incorrect

**Solution**: 
- Check that the user exists in Authentication > Users
- Reset the password if needed
- Make sure the user is confirmed (check "Confirmed" status)

### Can't access dashboard after login

This usually means:
1. The auth session expired
2. The user was removed from `admin_users` table
3. Browser cache issues

**Solution**:
- Check browser console for errors
- Clear browser cache and try again
- Verify the user exists in `admin_users` table with `is_active = true`


