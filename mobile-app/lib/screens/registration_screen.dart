import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons_flutter.dart';
import 'package:provider/provider.dart';
import 'package:Hello_pay/providers/auth_provider.dart';

class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({super.key});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _pinController = TextEditingController();
  final _referralController = TextEditingController();
  
  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 60),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              FadeInDown(
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(LucideIcons.chevronLeft, color: Colors.white, size: 28),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: Colors.indigo,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(LucideIcons.zap, color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'HelloPay',
                      style: GoogleFonts.outfit(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              FadeInRight(
                child: Text(
                  'Forge Identity',
                  style: GoogleFonts.outfit(
                    fontSize: 40,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    height: 1.1,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              FadeInRight(
                delay: const Duration(milliseconds: 100),
                child: Text(
                  'Join the decentralized financial elite.',
                  style: GoogleFonts.outfit(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Colors.white38,
                  ),
                ),
              ),
              const SizedBox(height: 40),
              
              _buildInputField(
                controller: _nameController,
                hint: 'Full Name',
                icon: LucideIcons.user,
              ),
              const SizedBox(height: 16),
              
              _buildInputField(
                controller: _phoneController,
                hint: 'Phone Number',
                icon: LucideIcons.smartphone,
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),
              
              _buildInputField(
                controller: _emailController,
                hint: 'Email Address',
                icon: LucideIcons.mail,
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              
              _buildInputField(
                controller: _passwordController,
                hint: 'Master Password',
                icon: LucideIcons.lock,
                obscure: _obscurePassword,
                suffix: IconButton(
                  icon: Icon(
                    _obscurePassword ? LucideIcons.eye : LucideIcons.eyeOff,
                    color: Colors.white24,
                  ),
                  onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                ),
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: _buildInputField(
                      controller: _pinController,
                      hint: 'Security PIN',
                      icon: LucideIcons.fingerprint,
                      keyboardType: TextInputType.number,
                      maxLength: 4,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    flex: 3,
                    child: _buildInputField(
                      controller: _referralController,
                      hint: 'Referral Code',
                      icon: LucideIcons.users,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 40),
              FadeInUp(
                delay: const Duration(milliseconds: 200),
                child: SizedBox(
                   width: double.infinity,
                   height: 64,
                   child: ElevatedButton(
                    onPressed: authProvider.isLoading ? null : () async {
                      if (_nameController.text.isEmpty || _phoneController.text.isEmpty || _pinController.text.length != 4) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Please fill all required fields correctly')),
                        );
                        return;
                      }

                      final success = await authProvider.register({
                        'name': _nameController.text,
                        'phone': _phoneController.text,
                        'email': _emailController.text,
                        'password': _passwordController.text,
                        'pincode': _pinController.text,
                        'referral': _referralController.text,
                      });

                      if (success) {
                        Navigator.pushReplacementNamed(context, '/dashboard');
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Registration failed')),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.indigo,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      elevation: 0,
                    ),
                    child: authProvider.isLoading 
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          'Initialize Account',
                          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800),
                        ),
                   ),
                ),
              ),
              const SizedBox(height: 24),
              Center(
                child: FadeInUp(
                  delay: const Duration(milliseconds: 300),
                  child: TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text(
                      'Already have an account? Sign In',
                      style: GoogleFonts.outfit(color: Colors.white38, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    bool obscure = false,
    Widget? suffix,
    int? maxLength,
  }) {
    return FadeInUp(
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white12),
        ),
        child: TextField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscure,
          maxLength: maxLength,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Colors.white24),
            prefixIcon: Icon(icon, color: Colors.white24),
            suffixIcon: suffix,
            border: InputBorder.none,
            counterText: "",
            contentPadding: const EdgeInsets.all(20),
          ),
        ),
      ),
    );
  }
}
