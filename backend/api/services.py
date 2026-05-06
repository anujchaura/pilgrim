from datetime import timedelta
from fuzzywuzzy import fuzz
from .models import BankStatement, InternalLedger, NormalizedLedger

def run_reconciliation():
    # Clear existing normalized ledgers to re-run
    NormalizedLedger.objects.all().delete()
    
    bank_statements = list(BankStatement.objects.all())
    internal_ledgers = list(InternalLedger.objects.all())

    matched_internal_ids = set()
    matched_bank_ids = set()

    # Create rules for auto-categorization based on narration (Bonus)
    category_rules = {
        'swiggy': 'Food',
        'zomato': 'Food',
        'uber': 'Travel',
        'ola': 'Travel',
        'aws': 'Cloud/Hosting',
        'render': 'Cloud/Hosting',
        'salary': 'Payroll'
    }

    def auto_categorize(narration):
        narration_lower = narration.lower()
        for key, cat in category_rules.items():
            if key in narration_lower:
                return cat
        return 'Uncategorized'

    for bank_txn in bank_statements:
        best_match = None
        best_score = 0
        
        for int_txn in internal_ledgers:
            if int_txn.id in matched_internal_ids:
                continue
                
            # Rule 1: Amount must match exactly
            if bank_txn.amount != int_txn.amount:
                continue
                
            # Rule 2: Date difference <= 2 days
            date_diff = abs((bank_txn.date - int_txn.date).days)
            if date_diff > 2:
                continue
                
            # Rule 3: Fuzzy match on narration/description
            similarity = fuzz.token_sort_ratio(str(bank_txn.narration), str(int_txn.description))
            
            # Threshold for string match
            if similarity > 50 and similarity > best_score:
                best_score = similarity
                best_match = int_txn
                
        if best_match:
            # Match
            NormalizedLedger.objects.create(
                date=bank_txn.date,
                amount=bank_txn.amount,
                category=best_match.category,
                source='bank',
                reconciliation_status='matched',
                bank_statement=bank_txn,
                internal_ledger=best_match
            )
            matched_internal_ids.add(best_match.id)
            matched_bank_ids.add(bank_txn.id)
        else:
            # Unmatched bank transaction
            category = auto_categorize(bank_txn.narration)
            NormalizedLedger.objects.create(
                date=bank_txn.date,
                amount=bank_txn.amount,
                category=category,
                source='bank',
                reconciliation_status='unmatched',
                bank_statement=bank_txn
            )
            
    # Unmatched internal ledgers
    for int_txn in internal_ledgers:
        if int_txn.id not in matched_internal_ids:
            NormalizedLedger.objects.create(
                date=int_txn.date,
                amount=int_txn.amount,
                category=int_txn.category,
                source='internal',
                reconciliation_status='unmatched',
                internal_ledger=int_txn
            )
