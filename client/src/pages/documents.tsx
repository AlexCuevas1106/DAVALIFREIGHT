import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  Image, 
  Download,
  Eye,
  Trash2,
  Camera,
  Receipt,
  FileCheck
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface DocumentFile {
  id: string;
  fileName: string;
  originalName: string;
  fileType: 'bill_of_lading' | 'fuel_receipt' | 'pdf_report';
  uploadDate: string;
  driverId: number;
  vehicleId?: number;
  fileSize: number;
  filePath: string;
}

export default function Documents() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  // Get current authenticated user
  const { user: currentUser, isLoading: authLoading } = useAuth();
  
  // Use authenticated user data
  const driver = {
    id: currentUser?.id || 1,
    name: currentUser?.name || "Unknown User",
    role: currentUser?.role || "driver"
  };

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['/api/documents', driver.id],
    queryFn: async () => {
      const response = await apiRequest(`/api/documents?driverId=${driver.id}`);
      return Array.isArray(response) ? response : [];
    },
    enabled: !!driver.id && !authLoading,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiRequest('/api/documents/upload', 'POST', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setSelectedFile(null);
      setFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-generate filename based on current date and time
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
      setFileName(`BOL_${timestamp}`);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !fileName.trim()) return;

    setIsUploading(true);
    try {
      // Convert file to base64
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(selectedFile);
      });

      const payload = {
        fileName: fileName.trim(),
        originalName: selectedFile.name,
        fileType: 'bill_of_lading',
        driverId: driver.id.toString(),
        fileSize: selectedFile.size.toString(),
        fileData
      };

      await uploadMutation.mutateAsync(payload);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteMutation.mutateAsync(documentId.toString());
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleDownload = async (document: DocumentFile) => {
    try {
      const response = await fetch(`/api/documents/${document.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = document.originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'bill_of_lading':
        return <FileCheck className="w-5 h-5 text-blue-600" />;
      case 'fuel_receipt':
        return <Receipt className="w-5 h-5 text-green-600" />;
      case 'pdf_report':
        return <FileText className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getFileTypeLabel = (fileType: string) => {
    switch (fileType) {
      case 'bill_of_lading':
        return 'Bill of Lading';
      case 'fuel_receipt':
        return 'Fuel Receipt';
      case 'pdf_report':
        return 'PDF Report';
      default:
        return 'Document';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter documents by type
  const billsOfLading = documents.filter((doc: DocumentFile) => doc.fileType === 'bill_of_lading');
  const fuelReceipts = documents.filter((doc: DocumentFile) => doc.fileType === 'fuel_receipt');
  const pdfReports = documents.filter((doc: DocumentFile) => doc.fileType === 'pdf_report');

  const renderDocumentList = (docs: DocumentFile[], emptyMessage: string) => (
    <div className="space-y-3">
      {docs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      ) : (
        docs.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              {getFileIcon(doc.fileType)}
              <div>
                <h4 className="font-medium text-gray-900">{doc.fileName}</h4>
                <p className="text-sm text-gray-500">
                  {formatFileSize(doc.fileSize)} • {formatRelativeTime(new Date(doc.uploadDate))}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {getFileTypeLabel(doc.fileType)}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(doc)}
                className="flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(doc.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Show loading while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Please login to access documents</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 ml-64">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {driver.name}</span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {driver.role}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
              <p className="text-gray-600">Upload, organize, and manage your documents</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Section */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>Upload Bill of Lading</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload">Select Image</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  {selectedFile && (
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Image className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">{selectedFile.name}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="fileName">Custom File Name</Label>
                        <Input
                          id="fileName"
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                          placeholder="Enter custom name for this file"
                        />
                      </div>
                      
                      <Button
                        onClick={handleUpload}
                        disabled={!fileName.trim() || isUploading}
                        className="w-full"
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 mr-2" />
                            Upload Document
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Files are automatically organized by driver</p>
                    <p>• Images are stored securely in the database</p>
                    <p>• Supported formats: JPG, PNG, HEIC</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Document Lists */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="bills" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="bills" className="flex items-center space-x-2">
                    <FileCheck className="w-4 h-4" />
                    <span>Bills of Lading ({billsOfLading.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="receipts" className="flex items-center space-x-2">
                    <Receipt className="w-4 h-4" />
                    <span>Fuel Receipts ({fuelReceipts.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>PDF Reports ({pdfReports.length})</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="bills" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Bills of Lading</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        renderDocumentList(billsOfLading, "No bills of lading uploaded yet")
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="receipts" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Fuel Receipts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        renderDocumentList(fuelReceipts, "No fuel receipts from expense reports yet")
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="reports" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>PDF Reports Archive</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        renderDocumentList(pdfReports, "No PDF reports generated yet")
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
    </div>
  );
}