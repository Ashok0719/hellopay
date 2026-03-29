import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons_flutter.dart';
import 'package:provider/provider.dart';
import 'package:Hello_pay/providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  final _nameController = TextEditingController();
  bool _otpSent = false;
  bool _isNewUser = false;

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 80),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              FadeInDown(
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Colors.indigo, Colors.blueAccent],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.indigo.withOpacity(0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: const Icon(LucideIcons.zap, color: Colors.white, size: 24),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'HelloPay',
                      style: GoogleFonts.outfit(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: -1,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 60),
              FadeInRight(
                child: Text(
                  _otpSent ? 'Verify ID' : 'Neural Access',
                  style: GoogleFonts.outfit(
                    fontSize: 40,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    height: 1.1,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              FadeInRight(
                delay: const Duration(milliseconds: 100),
                child: Text(
                  _otpSent 
                    ? 'Enter the signal sent to your device.'
                    : 'Secure your financial gravity without passwords.',
                  style: GoogleFonts.outfit(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Colors.white38,
                  ),
                ),
              ),
              const SizedBox(height: 48),
              
              if (!_otpSent) ...[
                FadeInUp(
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withOpacity(0.5),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: TextField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      decoration: InputDecoration(
                        hintText: 'Mobile Number',
                        hintStyle: const TextStyle(color: Colors.white24),
                        prefixIcon: const Icon(LucideIcons.smartphone, color: Colors.indigoAccent),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.all(20),
                      ),
                    ),
                  ),
                ),
              ] else ...[
                FadeInUp(
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withOpacity(0.5),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: TextField(
                      controller: _otpController,
                      keyboardType: TextInputType.number,
                      maxLength: 6,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        color: Colors.indigoAccent, 
                        fontSize: 24, 
                        fontWeight: FontWeight.w900,
                        letterSpacing: 10,
                      ),
                      decoration: const InputDecoration(
                        hintText: '000000',
                        hintStyle: TextStyle(color: Colors.white12, letterSpacing: 10),
                        counterText: '',
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.all(20),
                      ),
                    ),
                  ),
                ),
                if (_isNewUser) ...[
                  const SizedBox(height: 16),
                  FadeInUp(
                    delay: const Duration(milliseconds: 100),
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.indigo.withOpacity(0.2)),
                      ),
                      child: TextField(
                        controller: _nameController,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(
                          hintText: 'Your Display Name',
                          hintStyle: TextStyle(color: Colors.white24),
                          prefixIcon: Icon(LucideIcons.user, color: Colors.indigoAccent),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.all(20),
                        ),
                      ),
                    ),
                  ),
                ],
              ],

              const SizedBox(height: 32),
              FadeInUp(
                delay: const Duration(milliseconds: 200),
                child: SizedBox(
                   width: double.infinity,
                   height: 64,
                   child: ElevatedButton(
                    onPressed: authProvider.isLoading ? null : () async {
                      if (!_otpSent) {
                        final success = await authProvider.sendOtp(_phoneController.text);
                        if (success) {
                          setState(() => _otpSent = true);
                        } else {
                          _showError('Failed to send signal. Try again.');
                        }
                      } else {
                        final success = await authProvider.verifyOtp(
                          _phoneController.text, 
                          _otpController.text,
                          name: _isNewUser ? _nameController.text : null,
                        );
                        if (success) {
                          Navigator.pushReplacementNamed(context, '/dashboard');
                        } else {
                          _showError('Invalid signal verification.');
                          if (!_isNewUser) setState(() => _isNewUser = true);
                        }
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.indigo,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                      elevation: 0,
                    ),
                    child: authProvider.isLoading 
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          _otpSent ? 'Synchronize' : 'Transmit Signal',
                          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, fontStyle: FontStyle.italic),
                        ),
                   ),
                ),
              ),
              const SizedBox(height: 24),
              if (_otpSent)
                Center(
                  child: TextButton(
                    onPressed: () => setState(() { _otpSent = false; _isNewUser = false; }),
                    child: Text(
                      'Resend or Change Number',
                      style: GoogleFonts.outfit(color: Colors.white38, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.redAccent,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
