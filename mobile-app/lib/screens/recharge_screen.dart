import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons_flutter.dart';

class RechargeScreen extends StatefulWidget {
  const RechargeScreen({super.key});

  @override
  State<RechargeScreen> createState() => _RechargeScreenState();
}

class _RechargeScreenState extends State<RechargeScreen> {
  final _phoneController = TextEditingController();
  final _amountController = TextEditingController();
  String _selectedOperator = 'Airtel';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Colors.white60),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Mobile Recharge',
          style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white),
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              FadeInDown(
                child: Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: Colors.emeraldAccent.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(LucideIcons.smartphone, color: Colors.emeraldAccent, size: 32),
                ),
              ),
              const SizedBox(height: 32),
              Text(
                'Top Up Mobile',
                style: GoogleFonts.outfit(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white, height: 1.1),
              ),
              const SizedBox(height: 8),
              Text(
                'Instant recharge for any operator.',
                style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w500, color: Colors.white38),
              ),
              const SizedBox(height: 48),
              _buildPhoneInput(),
              const SizedBox(height: 24),
              _buildOperatorSelector(),
              const SizedBox(height: 24),
              _buildAmountInput(),
              const SizedBox(height: 48),
              _buildSubmitButton(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPhoneInput() {
    return FadeInUp(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.white12),
        ),
        child: TextField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white),
          decoration: const InputDecoration(
            hintText: 'Phone Number',
            border: InputBorder.none,
            prefixIcon: Icon(LucideIcons.phone, color: Colors.white24),
          ),
        ),
      ),
    );
  }

  Widget _buildOperatorSelector() {
    return FadeInUp(
      delay: const Duration(milliseconds: 100),
      child: SizedBox(
        height: 60,
        child: ListView(
          scrollDirection: Axis.horizontal,
          children: ['Airtel', 'Jio', 'Vi', 'BSNL'].map((op) {
            bool active = _selectedOperator == op;
            return GestureDetector(
              onTap: () => setState(() => _selectedOperator = op),
              child: Container(
                margin: const EdgeInsets.only(right: 12),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                decoration: BoxDecoration(
                  color: active ? Colors.indigoAccent : const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: active ? Colors.indigoAccent : Colors.white12),
                ),
                child: Center(
                  child: Text(
                    op,
                    style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: active ? Colors.white : Colors.white38),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildAmountInput() {
    return FadeInUp(
      delay: const Duration(milliseconds: 200),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoaration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: Colors.white12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Amount', style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white24, letterSpacing: 2)),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              style: GoogleFonts.outfit(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white),
              decoration: const InputDecoration(
                hintText: '0.00',
                prefixText: '₹ ',
                prefixStyle: TextStyle(color: Colors.white24),
                border: InputBorder.none,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubmitButton() {
     return FadeInUp(
      delay: const Duration(milliseconds: 300),
      child: SizedBox(
        width: double.infinity,
        height: 72,
        child: ElevatedButton(
          onPressed: () {},
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.indigoAccent,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
            elevation: 20,
            shadowColor: Colors.indigoAccent.withOpacity(0.5),
          ),
          child: Text(
            'CONFIRM RECHARGE',
            style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 1),
          ),
        ),
      ),
    );
  }
}

// Fix typo in BoxDecoaration
extension on Widget {
   BoxDecoration BoxDecoaration({required Color color, required BorderRadius borderRadius, required Border border}) {
     return BoxDecoration(color: color, borderRadius: borderRadius, border: border);
   }
}
