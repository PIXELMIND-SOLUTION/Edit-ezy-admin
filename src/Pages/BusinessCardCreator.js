import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Card,
  CardBody,
  CardTitle,
  Alert,
  Row,
  Col,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Badge
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaCloudUploadAlt, 
  FaTimes, 
  FaSpinner, 
  FaPlus, 
  FaTrash,
  FaEye,
  FaSave,
  FaMousePointer,
  FaDownload,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaQrcode,
  FaPalette,
  FaFont,
  FaImages,
  FaCheckCircle,
  FaArrowsAlt,
  FaFillDrip,
  FaBold,
  FaItalic,
  FaUnderline,
  FaInfoCircle,
  FaSquare,
  FaRegCircle
} from 'react-icons/fa';
import html2canvas from 'html2canvas';

// Function to convert image URL to base64 to avoid CORS
const getBase64FromUrl = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

const BusinessCardCreator = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Templates
  const [templateImage, setTemplateImage] = useState(null); // Original uploaded template (no overlay)
  const [originalTemplateFile, setOriginalTemplateFile] = useState(null); // Store original file
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  
  // Logo settings
  const [logoSettings, setLogoSettings] = useState({
    x: 20,
    y: 20,
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 0,
    borderColor: '#000000',
    shape: 'rectangle'
  });
  
  // Card Data
  const [cardData, setCardData] = useState({
    name: 'John Doe',
    title: 'CEO & Founder',
    company: 'Tech Solutions Inc.',
    email: 'john@techsolutions.com',
    phone: '+1 234 567 8900',
    address: '123 Business Street, New York, NY 10001',
    website: 'www.techsolutions.com',
    logo: null,
    qrCode: null,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#3b82f6',
    fontFamily: 'Poppins',
    fontSize: '14',
    showLogo: true,
    showQrCode: false,
    roundedCorners: true,
    shadow: true,
    border: true,
    useTemplate: false
  });
  
  // Text Styles
  const [textStyles, setTextStyles] = useState({
    name: { fontSize: 28, fontWeight: 'bold', color: '#000000', italic: false, underline: false, x: 50, y: 100 },
    title: { fontSize: 18, fontWeight: 'normal', color: '#666666', italic: false, underline: false, x: 50, y: 150 },
    company: { fontSize: 16, fontWeight: 'normal', color: '#888888', italic: false, underline: false, x: 50, y: 190 },
    email: { fontSize: 14, fontWeight: 'normal', color: '#666666', italic: false, underline: false, x: 50, y: 250 },
    phone: { fontSize: 14, fontWeight: 'normal', color: '#666666', italic: false, underline: false, x: 50, y: 280 },
    address: { fontSize: 12, fontWeight: 'normal', color: '#666666', italic: false, underline: false, x: 50, y: 310 },
    website: { fontSize: 12, fontWeight: 'normal', color: '#666666', italic: false, underline: false, x: 50, y: 340 }
  });
  
  // Social Links with real icons
  const [socialLinks, setSocialLinks] = useState([
    { id: 'fb1', platform: 'facebook', url: '', iconUrl: 'https://cdn-icons-png.flaticon.com/128/5968/5968764.png', iconBase64: '', iconName: 'Facebook', color: '#1877f2', x: 50, y: 400, iconSize: 30, showUrl: true, urlColor: '#666666', urlFontSize: 12 },
    { id: 'ig1', platform: 'instagram', url: '', iconUrl: 'https://cdn-icons-png.flaticon.com/128/4138/4138124.png', iconBase64: '', iconName: 'Instagram', color: '#e4405f', x: 50, y: 440, iconSize: 30, showUrl: true, urlColor: '#666666', urlFontSize: 12 },
    { id: 'tw1', platform: 'twitter', url: '', iconUrl: 'https://cdn-icons-png.flaticon.com/128/5969/5969020.png', iconBase64: '', iconName: 'Twitter', color: '#1da1f2', x: 50, y: 480, iconSize: 30, showUrl: true, urlColor: '#666666', urlFontSize: 12 },
    { id: 'li1', platform: 'linkedin', url: '', iconUrl: 'https://cdn-icons-png.flaticon.com/128/3536/3536505.png', iconBase64: '', iconName: 'LinkedIn', color: '#0077b5', x: 50, y: 520, iconSize: 30, showUrl: true, urlColor: '#666666', urlFontSize: 12 }
  ]);
  
  const [previewImage, setPreviewImage] = useState(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState('name');
  const [selectedSocial, setSelectedSocial] = useState(null);
  const [iconsLoaded, setIconsLoaded] = useState(false);
  
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const qrInputRef = useRef(null);
  const templateInputRef = useRef(null);
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const templateCanvasRef = useRef(null); // Separate canvas for template display

  const availablePlatforms = [
    { name: 'facebook', iconUrl: 'https://cdn-icons-png.flaticon.com/128/5968/5968764.png', color: '#1877f2' },
    { name: 'instagram', iconUrl: 'https://cdn-icons-png.flaticon.com/128/4138/4138124.png', color: '#e4405f' },
    { name: 'twitter', iconUrl: 'https://cdn-icons-png.flaticon.com/128/5969/5969020.png', color: '#1da1f2' },
    { name: 'linkedin', iconUrl: 'https://cdn-icons-png.flaticon.com/128/3536/3536505.png', color: '#0077b5' },
    { name: 'youtube', iconUrl: 'https://cdn-icons-png.flaticon.com/128/1384/1384060.png', color: '#ff0000' },
    { name: 'github', iconUrl: 'https://cdn-icons-png.flaticon.com/128/733/733609.png', color: '#333333' },
    { name: 'whatsapp', iconUrl: 'https://cdn-icons-png.flaticon.com/128/733/733585.png', color: '#25d366' },
    { name: 'website', iconUrl: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png', color: '#6c757d' }
  ];

  // Load icons as base64 to avoid CORS
  useEffect(() => {
    const loadIconsAsBase64 = async () => {
      const updatedLinks = [...socialLinks];
      for (let i = 0; i < updatedLinks.length; i++) {
        if (updatedLinks[i].iconUrl && !updatedLinks[i].iconBase64) {
          const base64 = await getBase64FromUrl(updatedLinks[i].iconUrl);
          if (base64) {
            updatedLinks[i].iconBase64 = base64;
          }
        }
      }
      setSocialLinks(updatedLinks);
      setIconsLoaded(true);
    };
    loadIconsAsBase64();
  }, []);

  const addSocialLink = () => {
    const newId = `social_${Date.now()}`;
    setSocialLinks([...socialLinks, { 
      id: newId,
      platform: 'website', 
      url: '', 
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png',
      iconBase64: '',
      iconName: 'Website',
      color: '#6c757d', 
      x: 50, 
      y: 560,
      iconSize: 30,
      showUrl: true,
      urlColor: '#666666',
      urlFontSize: 12
    }]);
  };

  const removeSocialLink = (id) => {
    setSocialLinks(socialLinks.filter(s => s.id !== id));
    if (selectedSocial === id) setSelectedSocial(null);
  };

  const updateSocialLink = (id, field, value) => {
    setSocialLinks(socialLinks.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const changeSocialPlatform = async (id, platform) => {
    const base64 = await getBase64FromUrl(platform.iconUrl);
    setSocialLinks(socialLinks.map(s => s.id === id ? { 
      ...s, 
      platform: platform.name,
      iconUrl: platform.iconUrl,
      iconBase64: base64 || '',
      iconName: platform.name.charAt(0).toUpperCase() + platform.name.slice(1),
      color: platform.color
    } : s));
  };

  const updateTextStyle = (field, styleName, value) => {
    setTextStyles(prev => ({
      ...prev,
      [field]: { ...prev[field], [styleName]: value }
    }));
  };

  const updateTextPosition = (field, x, y) => {
    setTextStyles(prev => ({
      ...prev,
      [field]: { ...prev[field], x, y }
    }));
  };

  const updateSocialPosition = (id, x, y) => {
    setSocialLinks(socialLinks.map(s => s.id === id ? { ...s, x, y } : s));
  };

  const updateLogoPosition = (x, y) => {
    setLogoSettings(prev => ({ ...prev, x, y }));
  };

  const updateLogoSize = (width, height) => {
    setLogoSettings(prev => ({ ...prev, width, height }));
  };

  const getLogoShapeStyle = () => {
    if (logoSettings.shape === 'circle') {
      return { borderRadius: '50%' };
    } else if (logoSettings.shape === 'rounded') {
      return { borderRadius: `${logoSettings.borderRadius}px` };
    }
    return { borderRadius: '0' };
  };

  // Draw canvas with all overlays (for preview)
  useEffect(() => {
    if (cardData.useTemplate && templateImage && canvasRef.current && iconsLoaded) {
      drawCanvasWithOverlays();
    }
  }, [templateImage, cardData, textStyles, socialLinks, previewImage, logoSettings, iconsLoaded]);

  const drawCanvasWithOverlays = () => {
    if (!canvasRef.current || !templateImage) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      // Draw text fields
      const fields = ['name', 'title', 'company', 'email', 'phone', 'address', 'website'];
      fields.forEach(field => {
        const style = textStyles[field];
        const text = cardData[field];
        if (text && style) {
          let fontStyle = '';
          if (style.italic) fontStyle += 'italic ';
          fontStyle += style.fontWeight;
          ctx.font = `${fontStyle} ${style.fontSize}px ${cardData.fontFamily}`;
          ctx.fillStyle = style.color;
          ctx.fillText(text, style.x, style.y);
          
          if (style.underline) {
            const metrics = ctx.measureText(text);
            ctx.beginPath();
            ctx.moveTo(style.x, style.y + 5);
            ctx.lineTo(style.x + metrics.width, style.y + 5);
            ctx.stroke();
          }
        }
      });
      
      // Draw social icons
      socialLinks.forEach((social) => {
        if (social.url && social.url.trim() !== '' && social.iconBase64) {
          const socialImg = new Image();
          socialImg.onload = () => {
            ctx.drawImage(socialImg, social.x - social.iconSize/2, social.y - social.iconSize/2, social.iconSize, social.iconSize);
          };
          socialImg.src = social.iconBase64;
          
          if (social.showUrl) {
            ctx.fillStyle = social.urlColor;
            ctx.font = `${social.urlFontSize}px ${cardData.fontFamily}`;
            let displayUrl = social.url;
            if (displayUrl.length > 35) displayUrl = displayUrl.substring(0, 32) + '...';
            ctx.fillText(displayUrl, social.x + social.iconSize/2 + 8, social.y + 5);
          }
        }
      });
      
      // Draw logo
      if (cardData.showLogo && previewImage) {
        const logo = new Image();
        logo.crossOrigin = 'Anonymous';
        logo.onload = () => {
          ctx.save();
          if (logoSettings.borderWidth > 0) {
            ctx.strokeStyle = logoSettings.borderColor;
            ctx.lineWidth = logoSettings.borderWidth;
          }
          
          if (logoSettings.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(logoSettings.x + logoSettings.width/2, logoSettings.y + logoSettings.height/2, logoSettings.width/2, 0, 2 * Math.PI);
            ctx.clip();
          } else if (logoSettings.shape === 'rounded') {
            ctx.beginPath();
            ctx.roundRect(logoSettings.x, logoSettings.y, logoSettings.width, logoSettings.height, logoSettings.borderRadius);
            ctx.clip();
          }
          
          ctx.drawImage(logo, logoSettings.x, logoSettings.y, logoSettings.width, logoSettings.height);
          
          if (logoSettings.borderWidth > 0) {
            ctx.stroke();
          }
          ctx.restore();
        };
        logo.src = previewImage;
      }
      
      // Draw QR code
      if (cardData.showQrCode && cardData.qrCode) {
        const qr = new Image();
        qr.onload = () => {
          ctx.drawImage(qr, canvas.width - 100, canvas.height - 100, 80, 80);
        };
        qr.src = URL.createObjectURL(cardData.qrCode);
      }
    };
    img.src = templateImage;
  };

  // RoundRect helper
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      this.moveTo(x+r, y);
      this.lineTo(x+w-r, y);
      this.quadraticCurveTo(x+w, y, x+w, y+r);
      this.lineTo(x+w, y+h-r);
      this.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
      this.lineTo(x+r, y+h);
      this.quadraticCurveTo(x, y+h, x, y+h-r);
      this.lineTo(x, y+r);
      this.quadraticCurveTo(x, y, x+r, y);
      return this;
    };
  }

  // Mouse handlers for dragging
  const handleCanvasMouseDown = (e) => {
    if (!cardData.useTemplate) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    const fields = ['name', 'title', 'company', 'email', 'phone', 'address', 'website'];
    for (const field of fields) {
      const style = textStyles[field];
      const text = cardData[field];
      if (text && style) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        let fontStyle = '';
        if (style.italic) fontStyle += 'italic ';
        fontStyle += style.fontWeight;
        tempCtx.font = `${fontStyle} ${style.fontSize}px ${cardData.fontFamily}`;
        const metrics = tempCtx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = style.fontSize;
        
        if (mouseX >= style.x - 10 && mouseX <= style.x + textWidth + 10 &&
            mouseY >= style.y - textHeight - 5 && mouseY <= style.y + 10) {
          setIsDragging(true);
          setDragTarget({ type: 'text', field });
          setDragStart({ x: mouseX - style.x, y: mouseY - style.y });
          return;
        }
      }
    }
    
    for (let i = 0; i < socialLinks.length; i++) {
      const social = socialLinks[i];
      if (social.url && social.url.trim() !== '') {
        if (Math.abs(mouseX - social.x) < social.iconSize + 10 && Math.abs(mouseY - social.y) < social.iconSize + 10) {
          setIsDragging(true);
          setDragTarget({ type: 'social', index: i });
          setDragStart({ x: mouseX - social.x, y: mouseY - social.y });
          setSelectedSocial(social.id);
          return;
        }
      }
    }
    
    if (cardData.showLogo && previewImage) {
      if (mouseX >= logoSettings.x && mouseX <= logoSettings.x + logoSettings.width &&
          mouseY >= logoSettings.y && mouseY <= logoSettings.y + logoSettings.height) {
        setIsDragging(true);
        setDragTarget({ type: 'logo' });
        setDragStart({ x: mouseX - logoSettings.x, y: mouseY - logoSettings.y });
        return;
      }
    }
  };
  
  const handleCanvasMouseMove = (e) => {
    if (!isDragging || !dragTarget) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    if (dragTarget.type === 'text') {
      const newX = mouseX - dragStart.x;
      const newY = mouseY - dragStart.y;
      updateTextPosition(dragTarget.field, newX, newY);
    } else if (dragTarget.type === 'social') {
      const newX = mouseX - dragStart.x;
      const newY = mouseY - dragStart.y;
      updateSocialPosition(socialLinks[dragTarget.index].id, newX, newY);
    } else if (dragTarget.type === 'logo') {
      const newX = mouseX - dragStart.x;
      const newY = mouseY - dragStart.y;
      updateLogoPosition(newX, newY);
    }
  };
  
  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDragTarget(null);
  };

  const sampleTemplates = [
    { id: 1, name: 'Modern Blue', image: 'https://placehold.co/600x400/3b82f6/white?text=Modern+Blue+Template' },
    { id: 2, name: 'Elegant Gold', image: 'https://placehold.co/600x400/d4af37/white?text=Elegant+Gold+Template' },
    { id: 3, name: 'Minimal White', image: 'https://placehold.co/600x400/ffffff/black?text=Minimal+White+Template' },
    { id: 4, name: 'Dark Professional', image: 'https://placehold.co/600x400/1a1a2e/white?text=Dark+Professional' }
  ];

  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Template size should be less than 5MB');
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setTemplateImage(imageUrl);
      setOriginalTemplateFile(file); // Store original file for backend
      setCardData({ ...cardData, useTemplate: true });
      setShowTemplatePicker(false);
    }
  };

  const selectTemplate = (template) => {
    setTemplateImage(template.image);
    setOriginalTemplateFile(null); // Sample template, no file
    setCardData({ ...cardData, useTemplate: true });
    setShowTemplatePicker(false);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Logo size should be less than 2MB');
        return;
      }
      setCardData({ ...cardData, logo: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleQrChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCardData({ ...cardData, qrCode: file });
    }
  };

  const downloadCard = async () => {
    if (cardData.useTemplate && canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${cardData.name.replace(/\s/g, '_')}_business_card.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    } else if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, { 
          scale: 2, 
          backgroundColor: null,
          useCORS: true,
          logging: false 
        });
        const link = document.createElement('a');
        link.download = `${cardData.name.replace(/\s/g, '_')}_business_card.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Error downloading card:', error);
        setErrorMessage('Failed to download card');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    const formData = new FormData();
    
    // Basic Info
    formData.append('name', cardData.name);
    formData.append('title', cardData.title);
    formData.append('company', cardData.company || '');
    formData.append('email', cardData.email || '');
    formData.append('phone', cardData.phone || '');
    formData.append('address', cardData.address || '');
    formData.append('website', cardData.website || '');
    
    // Settings
    formData.append('socialLinks', JSON.stringify(socialLinks));
    formData.append('textStyles', JSON.stringify(textStyles));
    formData.append('logoSettings', JSON.stringify(logoSettings));
    formData.append('useTemplate', cardData.useTemplate);
    
    // Design
    formData.append('design', JSON.stringify({
      backgroundColor: cardData.backgroundColor,
      textColor: cardData.textColor,
      accentColor: cardData.accentColor,
      fontFamily: cardData.fontFamily,
      fontSize: cardData.fontSize,
      showLogo: cardData.showLogo,
      showQrCode: cardData.showQrCode,
      roundedCorners: cardData.roundedCorners,
      shadow: cardData.shadow,
      border: cardData.border
    }));
    
    // Files
    if (cardData.logo) {
      formData.append('logo', cardData.logo);
    }
    if (cardData.qrCode) {
      formData.append('qrCode', cardData.qrCode);
    }
    
    // Upload ORIGINAL TEMPLATE (without any overlays)
    if (originalTemplateFile) {
      // User uploaded custom template - send original file
      formData.append('templateImage', originalTemplateFile);
    } else if (templateImage && cardData.useTemplate) {
      // Sample template - convert to blob
      const response = await fetch(templateImage);
      const blob = await response.blob();
      formData.append('templateImage', blob, 'template.png');
    }
    
    // Capture PREVIEW IMAGE (with all overlays)
    if (cardData.useTemplate && canvasRef.current && templateImage) {
      try {
        const canvas = canvasRef.current;
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        formData.append('previewImage', blob); // Final card with all overlays
      } catch (err) {
        console.error('Error capturing preview:', err);
      }
    } else if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: null, useCORS: true });
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        formData.append('previewImage', blob);
      } catch (err) {
        console.error('Error capturing card:', err);
      }
    }
    
    try {
      const response = await axios.post(
        'http://localhost:4061/api/admin/createbusinesscard',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      
      console.log('Response:', response.data);
      setSuccessMessage('Business card created successfully!');
      
      setTimeout(() => {
        navigate('/businesscardslist');
      }, 2000);
      
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.response?.data?.message || 'Error creating business card');
    } finally {
      setLoading(false);
    }
  };

  // Render non-template preview
  const renderBusinessCard = () => {
    const cardStyle = {
      backgroundColor: cardData.backgroundColor,
      color: cardData.textColor,
      fontFamily: cardData.fontFamily,
      fontSize: `${cardData.fontSize}px`,
      borderRadius: cardData.roundedCorners ? '16px' : '0',
      boxShadow: cardData.shadow ? '0 20px 35px -10px rgba(0,0,0,0.2)' : 'none',
      border: cardData.border ? `1px solid ${cardData.accentColor}20` : 'none',
      maxWidth: '500px',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden'
    };
    
    const logoShapeStyle = getLogoShapeStyle();
    
    return (
      <div ref={cardRef} style={cardStyle} className="p-4">
        <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', backgroundColor: cardData.accentColor, opacity: 0.1, borderRadius: '0 0 0 100px' }} />
        
        <div className="d-flex align-items-start gap-3 mb-3">
          {cardData.showLogo && previewImage && (
            <img 
              src={previewImage} 
              alt="Logo" 
              style={{ 
                width: `${logoSettings.width}px`, 
                height: `${logoSettings.height}px`, 
                objectFit: 'contain',
                ...logoShapeStyle,
                border: logoSettings.borderWidth > 0 ? `${logoSettings.borderWidth}px solid ${logoSettings.borderColor}` : 'none'
              }} 
            />
          )}
          <div className="flex-grow-1">
            <h3 style={{ color: cardData.accentColor, marginBottom: '4px', fontSize: '24px' }}>{cardData.name}</h3>
            <p style={{ fontWeight: '500', marginBottom: '4px', fontSize: '14px' }}>{cardData.title}</p>
            <p style={{ opacity: 0.7, fontSize: '12px', marginBottom: '0' }}>{cardData.company}</p>
          </div>
        </div>
        
        <div style={{ borderTop: `2px solid ${cardData.accentColor}30`, margin: '12px 0' }} />
        
        <div style={{ fontSize: '12px' }}>
          {cardData.email && <div className="d-flex align-items-center gap-2 mb-1"><FaEnvelope style={{ color: cardData.accentColor }} /><span>{cardData.email}</span></div>}
          {cardData.phone && <div className="d-flex align-items-center gap-2 mb-1"><FaPhone style={{ color: cardData.accentColor }} /><span>{cardData.phone}</span></div>}
          {cardData.address && <div className="d-flex align-items-center gap-2 mb-1"><FaMapMarkerAlt style={{ color: cardData.accentColor }} /><span>{cardData.address}</span></div>}
          {cardData.website && <div className="d-flex align-items-center gap-2 mb-1"><FaGlobe style={{ color: cardData.accentColor }} /><span>{cardData.website}</span></div>}
        </div>
        
        {/* Social Links with real icons */}
        {socialLinks.filter(s => s.url && s.url.trim() !== '').length > 0 && (
          <div style={{ borderTop: `1px solid ${cardData.accentColor}30`, margin: '12px 0', paddingTop: '12px' }}>
            {socialLinks.filter(s => s.url && s.url.trim() !== '').map((social) => (
              <div key={social.id} className="d-flex align-items-center gap-2 mb-2">
                <img src={social.iconBase64 || social.iconUrl} alt={social.iconName} style={{ width: `${social.iconSize}px`, height: `${social.iconSize}px` }} />
                <a href={social.url.startsWith('http') ? social.url : `https://${social.url}`} target="_blank" rel="noopener noreferrer" style={{ color: social.color }}>
                  {social.url}
                </a>
                {social.showUrl && (
                  <span style={{ fontSize: `${social.urlFontSize}px`, color: social.urlColor, wordBreak: 'break-all' }}>{social.url}</span>
                )}
              </div>
            ))}
          </div>
        )}
        
        {cardData.showQrCode && cardData.qrCode && (
          <div className="text-center mt-3">
            <img src={URL.createObjectURL(cardData.qrCode)} alt="QR Code" style={{ width: '80px', height: '80px' }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <Container className="my-5">
      <Row>
        <Col md={7}>
          <Card className="shadow-lg border-0">
            <CardBody className="p-4">
              <CardTitle tag="h3" className="text-center text-primary mb-4"><FaUser className="me-2" />Business Card Creator</CardTitle>

              {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
              {successMessage && <Alert color="success">{successMessage}</Alert>}

              {/* Template Section */}
              <div className="mb-4 p-3 border rounded bg-light">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Label className="fw-bold mb-0"><FaImages className="me-2" />Card Template</Label>
                  <Button size="sm" color="primary" onClick={() => setShowTemplatePicker(!showTemplatePicker)}>
                    {cardData.useTemplate ? 'Change Template' : 'Upload Template'}
                  </Button>
                </div>
                
                {showTemplatePicker && (
                  <div className="mt-2">
                    <Button size="sm" color="secondary" onClick={() => templateInputRef.current.click()} className="w-100 mb-2">
                      <FaCloudUploadAlt /> Upload Custom Template
                    </Button>
                    <input ref={templateInputRef} type="file" hidden onChange={handleTemplateUpload} accept="image/*" />
                    <div className="row">
                      {sampleTemplates.map(template => (
                        <div key={template.id} className="col-6 col-md-3 mb-2">
                          <div className="border rounded p-1 text-center cursor-pointer" onClick={() => selectTemplate(template)}>
                            <img src={template.image} alt={template.name} style={{ width: '100%', height: '60px', objectFit: 'cover' }} />
                            <small>{template.name}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {cardData.useTemplate && templateImage && (
                  <Alert color="success" className="mt-2 mb-0">
                    <FaCheckCircle className="me-1" /> Template loaded! Click and drag any text, logo or icon on preview to reposition.
                  </Alert>
                )}
              </div>

              <Nav tabs className="mb-3">
                <NavItem><NavLink className={activeTab === '1' ? 'active' : ''} onClick={() => setActiveTab('1')}><FaUser /> Basic Info</NavLink></NavItem>
                <NavItem><NavLink className={activeTab === '2' ? 'active' : ''} onClick={() => setActiveTab('2')}><FaImages /> Social Media</NavLink></NavItem>
                <NavItem><NavLink className={activeTab === '3' ? 'active' : ''} onClick={() => setActiveTab('3')}><FaPalette /> Text Style</NavLink></NavItem>
                <NavItem><NavLink className={activeTab === '4' ? 'active' : ''} onClick={() => setActiveTab('4')}><FaImages /> Logo & Media</NavLink></NavItem>
              </Nav>

              <Form onSubmit={handleSubmit}>
                <TabContent activeTab={activeTab}>
                  {/* Basic Info Tab */}
                  <TabPane tabId="1">
                    <FormGroup><Label>Full Name *</Label><Input value={cardData.name} onChange={(e) => setCardData({...cardData, name: e.target.value})} /></FormGroup>
                    <FormGroup><Label>Job Title *</Label><Input value={cardData.title} onChange={(e) => setCardData({...cardData, title: e.target.value})} /></FormGroup>
                    <FormGroup><Label>Company</Label><Input value={cardData.company} onChange={(e) => setCardData({...cardData, company: e.target.value})} /></FormGroup>
                    <FormGroup><Label>Email</Label><Input type="email" value={cardData.email} onChange={(e) => setCardData({...cardData, email: e.target.value})} /></FormGroup>
                    <FormGroup><Label>Phone</Label><Input value={cardData.phone} onChange={(e) => setCardData({...cardData, phone: e.target.value})} /></FormGroup>
                    <FormGroup><Label>Address</Label><Input value={cardData.address} onChange={(e) => setCardData({...cardData, address: e.target.value})} /></FormGroup>
                    <FormGroup><Label>Website</Label><Input value={cardData.website} onChange={(e) => setCardData({...cardData, website: e.target.value})} /></FormGroup>
                  </TabPane>

                  {/* Social Media Tab */}
                  <TabPane tabId="2">
                    {socialLinks.map((social) => (
                      <Card key={social.id} className="mb-2">
                        <CardBody className="p-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center gap-2">
                              <img src={social.iconBase64 || social.iconUrl} alt={social.iconName} style={{ width: '30px', height: '30px' }} />
                              <strong>{social.iconName}</strong>
                              {social.url && <Badge color="success" pill className="ms-2">✓ Active</Badge>}
                            </div>
                            <Button size="sm" color="danger" onClick={() => removeSocialLink(social.id)}><FaTrash /></Button>
                          </div>
                          <div className="d-flex gap-2 mb-2">
                            <select className="form-control form-control-sm" value={social.platform} onChange={(e) => {
                              const platform = availablePlatforms.find(p => p.name === e.target.value);
                              if (platform) changeSocialPlatform(social.id, platform);
                            }}>
                              {availablePlatforms.map(p => <option key={p.name} value={p.name}>{p.name.charAt(0).toUpperCase() + p.name.slice(1)}</option>)}
                            </select>
                          </div>
                          <Input 
                            placeholder="Profile URL (e.g., facebook.com/username)" 
                            value={social.url} 
                            onChange={(e) => updateSocialLink(social.id, 'url', e.target.value)} 
                          />
                          <Row className="mt-2">
                            <Col xs={6}>
                              <Label className="small">Icon Size (px)</Label>
                              <Input type="number" size="sm" value={social.iconSize} onChange={(e) => updateSocialLink(social.id, 'iconSize', parseInt(e.target.value))} />
                            </Col>
                            <Col xs={6}>
                              <Label className="small">URL Font Size</Label>
                              <Input type="number" size="sm" value={social.urlFontSize} onChange={(e) => updateSocialLink(social.id, 'urlFontSize', parseInt(e.target.value))} />
                            </Col>
                          </Row>
                          <Row className="mt-2">
                            <Col xs={6}>
                              <Label className="small">URL Color</Label>
                              <Input type="color" size="sm" value={social.urlColor} onChange={(e) => updateSocialLink(social.id, 'urlColor', e.target.value)} />
                            </Col>
                          </Row>
                          <FormGroup check className="mt-2">
                            <Label check>
                              <Input type="checkbox" checked={social.showUrl} onChange={(e) => updateSocialLink(social.id, 'showUrl', e.target.checked)} />
                              <span className="ms-2">Show URL next to icon</span>
                            </Label>
                          </FormGroup>
                          {cardData.useTemplate && (
                            <small className="text-muted mt-2 d-block">💡 Click and drag icon on preview to reposition</small>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                    <Button color="primary" size="sm" onClick={addSocialLink}><FaPlus /> Add Social Link</Button>
                  </TabPane>

                  {/* Text Style Tab */}
                  <TabPane tabId="3">
                    <FormGroup>
                      <Label>Select Field to Style</Label>
                      <Input type="select" value={selectedElement} onChange={(e) => setSelectedElement(e.target.value)}>
                        <option value="name">Name</option>
                        <option value="title">Job Title</option>
                        <option value="company">Company</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="address">Address</option>
                        <option value="website">Website</option>
                      </Input>
                    </FormGroup>
                    
                    {selectedElement && (
                      <>
                        <Row>
                          <Col xs={6}>
                            <FormGroup><Label><FaFont /> Font Size (px)</Label><Input type="number" value={textStyles[selectedElement]?.fontSize} onChange={(e) => updateTextStyle(selectedElement, 'fontSize', parseInt(e.target.value))} /></FormGroup>
                          </Col>
                          <Col xs={6}>
                            <FormGroup><Label><FaFillDrip /> Color</Label><Input type="color" value={textStyles[selectedElement]?.color} onChange={(e) => updateTextStyle(selectedElement, 'color', e.target.value)} /></FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col xs={6}>
                            <FormGroup><Label><FaBold /> Font Weight</Label><Input type="select" value={textStyles[selectedElement]?.fontWeight} onChange={(e) => updateTextStyle(selectedElement, 'fontWeight', e.target.value)}><option value="normal">Normal</option><option value="bold">Bold</option></Input></FormGroup>
                          </Col>
                          <Col xs={6}>
                            <FormGroup check className="mt-4"><Label check><Input type="checkbox" checked={textStyles[selectedElement]?.italic} onChange={(e) => updateTextStyle(selectedElement, 'italic', e.target.checked)} /><span className="ms-2"><FaItalic /> Italic</span></Label></FormGroup>
                          </Col>
                        </Row>
                        <FormGroup check><Label check><Input type="checkbox" checked={textStyles[selectedElement]?.underline} onChange={(e) => updateTextStyle(selectedElement, 'underline', e.target.checked)} /><span className="ms-2"><FaUnderline /> Underline</span></Label></FormGroup>
                        
                        {cardData.useTemplate && (
                          <Alert color="info" className="mt-2"><FaArrowsAlt className="me-2" /> Click and drag this text on preview to reposition</Alert>
                        )}
                      </>
                    )}
                    
                    <hr />
                    <h6 className="mt-3">Card Design</h6>
                    <Row>
                      <Col xs={6}><FormGroup><Label>Background Color</Label><Input type="color" value={cardData.backgroundColor} onChange={(e) => setCardData({...cardData, backgroundColor: e.target.value})} /></FormGroup></Col>
                      <Col xs={6}><FormGroup><Label>Text Color</Label><Input type="color" value={cardData.textColor} onChange={(e) => setCardData({...cardData, textColor: e.target.value})} /></FormGroup></Col>
                      <Col xs={6}><FormGroup><Label>Accent Color</Label><Input type="color" value={cardData.accentColor} onChange={(e) => setCardData({...cardData, accentColor: e.target.value})} /></FormGroup></Col>
                      <Col xs={6}><FormGroup><Label>Font Family</Label><Input type="select" value={cardData.fontFamily} onChange={(e) => setCardData({...cardData, fontFamily: e.target.value})}><option>Poppins</option><option>Arial</option><option>Helvetica</option><option>Georgia</option></Input></FormGroup></Col>
                    </Row>
                    
                    <FormGroup check><Label check><Input type="checkbox" checked={cardData.roundedCorners} onChange={(e) => setCardData({...cardData, roundedCorners: e.target.checked})} /><span className="ms-2">Rounded Corners</span></Label></FormGroup>
                    <FormGroup check><Label check><Input type="checkbox" checked={cardData.shadow} onChange={(e) => setCardData({...cardData, shadow: e.target.checked})} /><span className="ms-2">Show Shadow</span></Label></FormGroup>
                    <FormGroup check><Label check><Input type="checkbox" checked={cardData.border} onChange={(e) => setCardData({...cardData, border: e.target.checked})} /><span className="ms-2">Show Border</span></Label></FormGroup>
                    <FormGroup check><Label check><Input type="checkbox" checked={cardData.showQrCode} onChange={(e) => setCardData({...cardData, showQrCode: e.target.checked})} /><span className="ms-2">Show QR Code</span></Label></FormGroup>
                  </TabPane>

                  {/* Logo & Media Tab */}
                  <TabPane tabId="4">
                    <FormGroup>
                      <Label>Logo Image</Label>
                      <div className="border rounded p-3 text-center cursor-pointer" onClick={() => logoInputRef.current.click()} style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}>
                        {previewImage ? <img src={previewImage} style={{ maxHeight: '100px' }} alt="Logo" /> : <><FaCloudUploadAlt size={40} /><p>Upload Logo</p></>}
                      </div>
                      <input ref={logoInputRef} type="file" hidden onChange={handleLogoChange} accept="image/*" />
                    </FormGroup>
                    
                    <FormGroup check>
                      <Label check>
                        <Input type="checkbox" checked={cardData.showLogo} onChange={(e) => setCardData({...cardData, showLogo: e.target.checked})} />
                        <span className="ms-2">Show Logo on Card</span>
                      </Label>
                    </FormGroup>
                    
                    {cardData.showLogo && previewImage && (
                      <>
                        <h6 className="mt-3">Logo Customization</h6>
                        <Row>
                          <Col xs={6}>
                            <FormGroup><Label>Width (px)</Label><Input type="number" value={logoSettings.width} onChange={(e) => updateLogoSize(parseInt(e.target.value), logoSettings.height)} /></FormGroup>
                          </Col>
                          <Col xs={6}>
                            <FormGroup><Label>Height (px)</Label><Input type="number" value={logoSettings.height} onChange={(e) => updateLogoSize(logoSettings.width, parseInt(e.target.value))} /></FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col xs={12}>
                            <FormGroup><Label>Logo Shape</Label>
                              <div className="d-flex gap-3">
                                <Button size="sm" color={logoSettings.shape === 'rectangle' ? 'primary' : 'secondary'} onClick={() => setLogoSettings({...logoSettings, shape: 'rectangle'})}>
                                  <FaSquare /> Rectangle
                                </Button>
                                <Button size="sm" color={logoSettings.shape === 'rounded' ? 'primary' : 'secondary'} onClick={() => setLogoSettings({...logoSettings, shape: 'rounded'})}>
                                  <FaSquare /> Rounded
                                </Button>
                                <Button size="sm" color={logoSettings.shape === 'circle' ? 'primary' : 'secondary'} onClick={() => setLogoSettings({...logoSettings, shape: 'circle'})}>
                                  <FaRegCircle /> Circle
                                </Button>
                              </div>
                            </FormGroup>
                          </Col>
                        </Row>
                        {logoSettings.shape === 'rounded' && (
                          <Row>
                            <Col xs={6}>
                              <FormGroup><Label>Border Radius (px)</Label><Input type="number" value={logoSettings.borderRadius} onChange={(e) => setLogoSettings({...logoSettings, borderRadius: parseInt(e.target.value)})} /></FormGroup>
                            </Col>
                          </Row>
                        )}
                        <Row>
                          <Col xs={6}>
                            <FormGroup><Label>Border Width (px)</Label><Input type="number" value={logoSettings.borderWidth} onChange={(e) => setLogoSettings({...logoSettings, borderWidth: parseInt(e.target.value)})} /></FormGroup>
                          </Col>
                          {logoSettings.borderWidth > 0 && (
                            <Col xs={6}>
                              <FormGroup><Label>Border Color</Label><Input type="color" value={logoSettings.borderColor} onChange={(e) => setLogoSettings({...logoSettings, borderColor: e.target.value})} /></FormGroup>
                            </Col>
                          )}
                        </Row>
                        {cardData.useTemplate && (
                          <Alert color="info" className="mt-2"><FaArrowsAlt className="me-2" /> Click and drag logo on preview to reposition</Alert>
                        )}
                      </>
                    )}
                    
                    <FormGroup className="mt-3">
                      <Label>QR Code (Optional)</Label>
                      <div className="border rounded p-3 text-center cursor-pointer" onClick={() => qrInputRef.current.click()} style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}>
                        <FaQrcode size={40} />
                        <p>Upload QR Code</p>
                      </div>
                      <input ref={qrInputRef} type="file" hidden onChange={handleQrChange} accept="image/*" />
                    </FormGroup>
                  </TabPane>
                </TabContent>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button color="secondary" onClick={() => navigate('/businesscardslist')}>Cancel</Button>
                  <Button color="primary" type="submit" disabled={loading}>
                    {loading ? <><FaSpinner className="spinner-border-sm me-1" /> Creating...</> : <><FaSave /> Create Card</>}
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>

        <Col md={5}>
          <Card className="shadow-lg border-0 sticky-top" style={{ top: '20px' }}>
            <CardBody className="p-4">
              <CardTitle tag="h4" className="text-center mb-3">
                Live Preview
                {cardData.useTemplate && <small className="d-block text-muted"><FaMousePointer /> Click and drag elements to reposition</small>}
              </CardTitle>
              <div className="preview-container">
                {cardData.useTemplate && templateImage ? (
                  <canvas
                    ref={canvasRef}
                    style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd', cursor: isDragging ? 'grabbing' : 'grab' }}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  />
                ) : renderBusinessCard()}
              </div>
              <div className="d-flex gap-2 mt-3">
                <Button color="success" onClick={downloadCard} className="flex-grow-1"><FaDownload /> Download Card</Button>
                <Button color="info" onClick={() => setShowFullPreview(true)} className="flex-grow-1"><FaEye /> Full Preview</Button>
              </div>
              <div className="mt-3 text-muted small">
                <p className="mb-0">💡 Features:</p>
                <ul className="mb-0 mt-1">
                  <li>Upload template or use default design</li>
                  <li>Click and drag text, logo, or icons to reposition</li>
                  <li>Real social media icons (Facebook, Instagram, Twitter, etc.)</li>
                  <li>Customize logo shape (Rectangle, Rounded, Circle)</li>
                  <li>Resize and style logo (border, radius, size)</li>
                  <li>Full text styling (size, color, bold, italic, underline)</li>
                  <li>Download as high-quality PNG</li>
                </ul>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Full Preview Modal */}
      {showFullPreview && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-body text-center">
                {cardData.useTemplate && templateImage ? <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} /> : renderBusinessCard()}
                <div className="mt-3">
                  <Button color="success" onClick={downloadCard}><FaDownload /> Download</Button>
                  <Button color="secondary" className="ms-2" onClick={() => setShowFullPreview(false)}>Close</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default BusinessCardCreator;