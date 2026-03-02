import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../api/authService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user } = await auth.signIn({
        email: formData.email,
        password: formData.password
      });

      // Check user approval status
      let profile = await auth.getUserProfile();

      // If the user_profiles row was accidentally deleted, re-create it
      if (!profile) {
        try {
          profile = await auth.recreateProfile(user);
        } catch (recreateErr) {
          console.error('Failed to recreate profile:', recreateErr);
          setError('Your profile is missing and could not be restored. Please contact the administrator.');
          await auth.signOut();
          setLoading(false);
          return;
        }
      }

      if (profile.status === 'pending') {
        setError('Your account is pending approval. Please wait for an administrator to approve your account.');
        await auth.signOut();
        setLoading(false);
        return;
      }

      if (profile.status === 'rejected') {
        setError('Your account has been rejected. Please contact the administrator.');
        await auth.signOut();
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (profile.role === 'Admin') {
        navigate('/AdminDashboard');
      } else if (profile.role === 'AssistantCoach') {
        navigate('/PoolsideCheckIn');
      } else if (profile.role === 'Swimmer') {
        navigate('/SwimmerStats');
      } else {
        navigate('/FamilyDashboard');
      }

      // AuthContext will automatically update via onAuthStateChange
    } catch (err) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log In</CardTitle>
          <CardDescription>
            Sign in to your Ceylon Swimming Academy account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/Signup" className="text-blue-600 hover:underline">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
