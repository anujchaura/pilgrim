from django.db import models

class BankStatement(models.Model):
    date = models.DateField()
    narration = models.TextField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    transaction_type = models.CharField(max_length=10) # 'credit' or 'debit'

    def __str__(self):
        return f"{self.date} - {self.amount} - {self.transaction_type}"

class InternalLedger(models.Model):
    date = models.DateField()
    description = models.TextField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    category = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.date} - {self.amount} - {self.category}"

class NormalizedLedger(models.Model):
    STATUS_CHOICES = (
        ('matched', 'Matched'),
        ('unmatched', 'Unmatched'),
    )
    SOURCE_CHOICES = (
        ('bank', 'Bank'),
        ('internal', 'Internal'),
    )
    
    date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    category = models.CharField(max_length=100, null=True, blank=True)
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES)
    reconciliation_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unmatched')
    bank_statement = models.ForeignKey(BankStatement, on_delete=models.SET_NULL, null=True, blank=True, related_name='ledgers')
    internal_ledger = models.ForeignKey(InternalLedger, on_delete=models.SET_NULL, null=True, blank=True, related_name='ledgers')

    def __str__(self):
        return f"{self.date} - {self.amount} - {self.reconciliation_status}"
