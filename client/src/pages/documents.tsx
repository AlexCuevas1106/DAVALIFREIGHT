
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  FileText,
  Image,
  Download,
  Trash2,
  Eye,
  Clock,
  CheckCircle
} from "lucide-react";

interface BillOfLading {
  id: number;
  name: string;
  fileName: string;
  uploadedAt: string;
  filePath: string;
  type: "bill_of_lading";
}

interface ExpenseTicket {
  id: number;
  name: string;
  fileName: string;
  uploadedAt: string;
  filePath: string;
  type: "expense_ticket";
}

interface PDFReport {
  id: number;
  name: string;
  fileName: string;
  createdAt: string;
  filePath: string;
  type: "pdf_report";
}

export default function Documents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Driver data
  const driver = {
    id: 1,
    name: "Skyler Droubay",
    status: "on_duty"
  };

  // Query para obtener documentos
  const { data: documents, isLoading } = useQuery({
    queryKey: ['/api/documents', { driverId: driver.id }],
  });

  // Separar documentos por tipo
  const billsOfLading = documents?.filter((doc: any) => doc.type === 'bill_of_lading') || [];
  const expenseTickets = documents?.filter((doc: any) => doc.type === 'expense_ticket') || [];
  const pdfReports = documents?.filter((doc: any) => doc.type === 'pdf_report') || [];

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bill of Lading uploaded successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setSelectedFile(null);
      setDocumentName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-generate name from file name
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setDocumentName(nameWithoutExt);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentName.trim()) {
      toast({
        title: "Error",
        description: "Please select a file and enter a name",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', documentName);
    formData.append('type', 'bill_of_lading');
    formData.append('driverId', driver.id.toString());

    try {
      await uploadMutation.mutateAsync(formData);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Document deleted successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <main>
        <Header 
          driver={driver}
          status={driver.status}
        />
        
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
            <p className="text-gray-600">Upload and manage your bills of lading, expense tickets, and reports</p>
          </div>

          {/* Upload Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Bill of Lading
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Select Image File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="document-name">Document Name</Label>
                  <Input
                    id="document-name"
                    type="text"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Enter a name for this document"
                    className="mt-1"
                  />
                </div>

                {selectedFile && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Image className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-700">{selectedFile.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !documentName.trim() || isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Bill of Lading
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bills of Lading */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Bills of Lading ({billsOfLading.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {billsOfLading.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No bills of lading uploaded yet
                    </p>
                  ) : (
                    billsOfLading.map((doc: any) => (
                      <div key={doc.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {doc.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(doc.filePath, '_blank')}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Expense Tickets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Image className="w-5 h-5 mr-2 text-green-600" />
                  Expense Tickets ({expenseTickets.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseTickets.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No expense tickets uploaded yet
                    </p>
                  ) : (
                    expenseTickets.map((doc: any) => (
                      <div key={doc.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {doc.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(doc.filePath, '_blank')}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* PDF Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2 text-purple-600" />
                  PDF Reports ({pdfReports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pdfReports.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No PDF reports created yet
                    </p>
                  ) : (
                    pdfReports.map((doc: any) => (
                      <div key={doc.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {doc.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(doc.createdAt)}
                            </p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              PDF Report
                            </Badge>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(doc.filePath, '_blank')}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
