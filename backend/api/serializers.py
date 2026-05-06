from rest_framework import serializers
from .models import BankStatement, InternalLedger, NormalizedLedger

class BankStatementSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankStatement
        fields = '__all__'

class InternalLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternalLedger
        fields = '__all__'

class NormalizedLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = NormalizedLedger
        fields = '__all__'
