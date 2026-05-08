import csv
from datetime import datetime
from django.db.models import Sum, Count
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from .models import BankStatement, InternalLedger, NormalizedLedger
from .serializers import NormalizedLedgerSerializer
from .services import run_reconciliation

def parse_date(date_str):
    """Try multiple date formats"""
    for fmt in ('%Y-%m-%d', '%d-%m-%Y', '%m/%d/%Y', '%d/%m/%Y'):
        try:
            return datetime.strptime(date_str.strip(), fmt).date()
        except ValueError:
            continue
    raise ValueError(f"Cannot parse date: {date_str}")

@api_view(['POST'])
@parser_classes([MultiPartParser])
def upload_csv(request):
    bank_file = request.FILES.get('bank_statement')
    ledger_file = request.FILES.get('internal_ledger')
    
    if bank_file:
        BankStatement.objects.all().delete() # Clear existing
        decoded_file = bank_file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)
        
        # Validate headers
        if not all(col in reader.fieldnames for col in ['date', 'narration', 'amount', 'type']):
            return Response({'error': 'Invalid Bank Statement CSV format. Required columns: date, narration, amount, type'}, status=400)
            
        for row in reader:
            BankStatement.objects.create(
                date=parse_date(row['date']),
                narration=row.get('narration', ''),
                amount=row['amount'],
                transaction_type=row.get('type', 'credit').lower()
            )
            
    if ledger_file:
        InternalLedger.objects.all().delete() # Clear existing
        decoded_file = ledger_file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)
        
        # Validate headers
        if not all(col in reader.fieldnames for col in ['date', 'description', 'amount', 'category']):
            return Response({'error': 'Invalid Internal Ledger CSV format. Required columns: date, description, amount, category'}, status=400)
            
        for row in reader:
            InternalLedger.objects.create(
                date=parse_date(row['date']),
                description=row.get('description', ''),
                amount=row['amount'],
                category=row.get('category', 'Uncategorized')
            )
            
    return Response({'message': 'Data uploaded successfully'})

@api_view(['POST'])
def trigger_reconciliation(request):
    run_reconciliation()
    return Response({'message': 'Reconciliation completed'})

@api_view(['GET'])
def summary(request):
    total_credits = BankStatement.objects.filter(transaction_type='credit').aggregate(Sum('amount'))['amount__sum'] or 0
    total_debits = BankStatement.objects.filter(transaction_type='debit').aggregate(Sum('amount'))['amount__sum'] or 0
    unmatched_amount = NormalizedLedger.objects.filter(reconciliation_status='unmatched').aggregate(Sum('amount'))['amount__sum'] or 0
    
    return Response({
        'total_credits': total_credits,
        'total_debits': total_debits,
        'unmatched_amount': unmatched_amount
    })

@api_view(['GET'])
def reconciliation_list(request):
    queryset = NormalizedLedger.objects.all().order_by('-date')
    status = request.query_params.get('status')
    if status:
        queryset = queryset.filter(reconciliation_status=status)
    serializer = NormalizedLedgerSerializer(queryset, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def category_breakdown(request):
    breakdown = NormalizedLedger.objects.values('category').annotate(total=Sum('amount')).order_by('-total')
    return Response(breakdown)
