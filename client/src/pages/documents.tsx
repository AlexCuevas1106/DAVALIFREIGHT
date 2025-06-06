
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
  FileText, 
  Upload,
  Download,
  Trash2,
  Camera,
  Receipt,
  File,
  Eye
} from "lucide-react";

interface Document {
  id: number;
  name: string;
  type: string;
  shipmentId?: number;
  driverId: number;
  filePath?: string;
  uploadedAt: string;
  isActive: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  type: 'bill_of_lading' | 'expense_receipt' | 'pdf_report';
  uploadDate: string;
  size?: number;
  file?: File;
}

export default function Documents() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Load uploaded files from localStorage
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(() => {
    const savedFiles = localStorage.getItem('uploadedFiles');
    const defaultFiles = [
      {
        id: "1",
        name: "BOL_Shipment_3-86539.jpg",
        type: "bill_of_lading" as const,
        uploadDate: "2024-01-15T10:30:00Z",
        size: 2485760
      },
      {
        id: "2", 
        name: "Fuel_Receipt_Phoenix.jpg",
        type: "expense_receipt" as const,
        uploadDate: "2024-01-14T14:22:00Z",
        size: 1024000
      }
    ];
    
    if (savedFiles) {
      const parsed = JSON.parse(savedFiles);
      return [...defaultFiles, ...parsed];
    }
    return defaultFiles;
  });

  // Driver data (you can get this from your dashboard query)
  const driver = {
    id: 1,
    name: "Skyler Droubay",
    status: "on_duty"
  };

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents', { driverId: driver.id }],
    initialData: []
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!fileName) {
        setFileName(file.name.split('.')[0]);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !fileName.trim()) {
      toast({
        title: "Error",
        description: "Please select a file and enter a name",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: `${fileName}.${selectedFile.name.split('.').pop()}`,
        type: "bill_of_lading",
        uploadDate: new Date().toISOString(),
        size: selectedFile.size,
        file: selectedFile
      };

      const updatedFiles = [newFile, ...uploadedFiles];
      setUploadedFiles(updatedFiles);
      localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles.filter(f => f.type !== 'bill_of_lading' && f.type !== 'expense_receipt')));
      
      setSelectedFile(null);
      setFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Success",
        description: "Bill of Lading uploaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(file => file.id !== fileId);
    setUploadedFiles(updatedFiles);
    
    // Update localStorage (excluding default files)
    const filesToSave = updatedFiles.filter(f => !["1", "2"].includes(f.id));
    localStorage.setItem('uploadedFiles', JSON.stringify(filesToSave));
    
    toast({
      title: "Success",
      description: "File deleted successfully",
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'bill_of_lading':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'expense_receipt':
        return <Receipt className="w-5 h-5 text-green-600" />;
      case 'pdf_report':
        return <File className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bill_of_lading':
        return 'Bill of Lading';
      case 'expense_receipt':
        return 'Expense Receipt';
      case 'pdf_report':
        return 'PDF Report';
      default:
        return 'Document';
    }
  };

  const billOfLadingFiles = uploadedFiles.filter(file => file.type === 'bill_of_lading');
  const expenseReceiptFiles = uploadedFiles.filter(file => file.type === 'expense_receipt');
  const pdfReportFiles = uploadedFiles.filter(file => file.type === 'pdf_report');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main>
        <Header 
          driver={driver}
          status={driver.status}
        />

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600">Manage your bills of lading, receipts, and reports</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Section */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-blue-600" />
                    Upload Bill of Lading
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="file-name">File Name</Label>
                    <Input
                      id="file-name"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="Enter file name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="file-upload">Select File</Label>
                    <Input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileSelect}
                      className="mt-1"
                    />
                  </div>

                  {selectedFile && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Camera className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{selectedFile.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={handleUpload} 
                    disabled={!selectedFile || !fileName.trim() || isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Files Listing */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bill of Lading Files */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Bills of Lading ({billOfLadingFiles.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {billOfLadingFiles.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No bills of lading uploaded yet</p>
                  ) : (
                    <div className="space-y-3">
                      {billOfLadingFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.type)}
                            <div>
                              <p className="font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(file.uploadDate)} • {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              {getTypeLabel(file.type)}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDelete(file.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expense Receipts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Receipt className="w-5 h-5 mr-2 text-green-600" />
                    Expense Receipts ({expenseReceiptFiles.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expenseReceiptFiles.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No expense receipts found</p>
                  ) : (
                    <div className="space-y-3">
                      {expenseReceiptFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.type)}
                            <div>
                              <p className="font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(file.uploadDate)} • {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              {getTypeLabel(file.type)}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDelete(file.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* PDF Reports */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <File className="w-5 h-5 mr-2 text-red-600" />
                    PDF Reports ({pdfReportFiles.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pdfReportFiles.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No PDF reports generated yet</p>
                  ) : (
                    <div className="space-y-3">
                      {pdfReportFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.type)}
                            <div>
                              <p className="font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(file.uploadDate)} • {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              {getTypeLabel(file.type)}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDelete(file.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
