import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './UserManual.css';

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string;
  language?: string; // 保留接口兼容，但内部使用 i18n
}

const UserManual: React.FC<UserManualProps> = ({ 
  isOpen, 
  onClose, 
  initialSection = 'quick-start',
}) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState(initialSection);

  // 当弹窗打开时，根据initialSection设置激活的章节
  useEffect(() => {
    if (isOpen) {
      setActiveSection(initialSection);
    }
  }, [isOpen, initialSection]);

  if (!isOpen) return null;

  const steps = t('userManual.quickStart.steps', { returnObjects: true }) as Array<{ step: string; operation: string; description: string }>;
  const smartChatItems = t('userManual.quickStart.features.smartChat.items', { returnObjects: true }) as string[];
  const courseManagementItems = t('userManual.quickStart.features.courseManagement.items', { returnObjects: true }) as string[];
  const fileCenterItems = t('userManual.quickStart.features.fileCenter.items', { returnObjects: true }) as string[];
  const billingItems = t('userManual.quickStart.features.billing.items', { returnObjects: true }) as string[];
  const faqItems = t('userManual.quickStart.faq', { returnObjects: true }) as Array<{ question: string; answer: string }>;
  const bestPractices = t('userManual.report.bestPractices', { returnObjects: true }) as string[];
  const formDetails = t('userManual.report.formDetails', { returnObjects: true }) as string[];
  const categories = t('userManual.report.categories', { returnObjects: true }) as Array<{ type: string; example: string }>;
  const slaData = t('userManual.report.slaData', { returnObjects: true }) as Array<{ level: string; description: string; response: string; target: string }>;
  const updateData = t('userManual.report.updateData', { returnObjects: true }) as Array<{ version: string; date: string; description: string }>;

  return (
    <div className="user-manual-overlay" onClick={onClose}>
      <div className="user-manual-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-manual-header">
          <h2>{t('userManual.title')}</h2>
          <button className="user-manual-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="user-manual-content">
          <div className="user-manual-sidebar">
            <nav className="user-manual-nav">
              <button 
                className={`user-manual-nav-item ${activeSection === 'quick-start' ? 'active' : ''}`}
                onClick={() => setActiveSection('quick-start')}
              >
                {t('userManual.navItems.userManual')}
              </button>
              <button 
                className={`user-manual-nav-item ${activeSection === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveSection('contact')}
              >
                {t('userManual.navItems.contactSupport')}
              </button>
              <button 
                className={`user-manual-nav-item ${activeSection === 'report' ? 'active' : ''}`}
                onClick={() => setActiveSection('report')}
              >
                {t('userManual.navItems.reportIssue')}
              </button>
            </nav>
          </div>
          
          <div className="user-manual-main">
            {activeSection === 'quick-start' && (
              <div className="user-manual-section">
                <h3>{t('userManual.quickStart.title')}</h3>
                
                <h4>{t('userManual.quickStart.subtitle1')}</h4>
                <div className="user-manual-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{t('userManual.quickStart.tableHeaders.step')}</th>
                        <th>{t('userManual.quickStart.tableHeaders.operation')}</th>
                        <th>{t('userManual.quickStart.tableHeaders.description')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {steps.map((step, index) => (
                        <tr key={index}>
                          <td>{step.step}</td>
                          <td>{step.operation}</td>
                          <td>{step.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h4>{t('userManual.quickStart.subtitle2')}</h4>
                <div className="user-manual-feature">
                  <h5>{t('userManual.quickStart.features.smartChat.title')}</h5>
                  <ul>
                    {smartChatItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="user-manual-feature">
                  <h5>{t('userManual.quickStart.features.courseManagement.title')}</h5>
                  <ul>
                    {courseManagementItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="user-manual-feature">
                  <h5>{t('userManual.quickStart.features.fileCenter.title')}</h5>
                  <ul>
                    {fileCenterItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="user-manual-feature">
                  <h5>{t('userManual.quickStart.features.billing.title')}</h5>
                  <ul>
                    {billingItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <h4>{t('userManual.quickStart.subtitle3')}</h4>
                <div className="user-manual-faq">
                  {faqItems.map((faq, index) => (
                    <div key={index} className="faq-item">
                      <h6>{faq.question}</h6>
                      <p>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'contact' && (
              <div className="user-manual-section">
                <h3>{t('userManual.contact.title')}</h3>
                <div className="contact-info">
                  <div className="contact-item">
                    <span className="contact-icon">📧</span>
                    <span className="contact-label">{t('userManual.contact.emailLabel')}</span>
                    <a href="mailto:cuhk.fyp.llm@outlook.com" className="contact-link">
                      cuhk.fyp.llm@outlook.com
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'report' && (
              <div className="user-manual-section">
                <h3>{t('userManual.report.title')}</h3>
                
                <h4>{t('userManual.report.subtitle1')}</h4>
                <ol>
                  {bestPractices.map((practice, index) => (
                    <li key={index}>
                      {practice}
                      {index === 1 && (
                        <ul>
                          {formDetails.map((detail, detailIndex) => (
                            <li key={detailIndex}>
                              <strong>{detail.split('：')[0]}：</strong>
                              {detail.split('：')[1]}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>

                <h4>{t('userManual.report.subtitle2')}</h4>
                <div className="user-manual-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{t('userManual.report.categoryHeader')}</th>
                        <th>{t('userManual.report.exampleHeader')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category, index) => (
                        <tr key={index}>
                          <td>{category.type}</td>
                          <td>{category.example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h4>{t('userManual.report.subtitle3')}</h4>
                <div className="user-manual-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{t('userManual.report.slaHeaders.level')}</th>
                        <th>{t('userManual.report.slaHeaders.description')}</th>
                        <th>{t('userManual.report.slaHeaders.response')}</th>
                        <th>{t('userManual.report.slaHeaders.target')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slaData.map((sla, index) => (
                        <tr key={index}>
                          <td>{sla.level}</td>
                          <td>{sla.description}</td>
                          <td>{sla.response}</td>
                          <td>{sla.target}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h4>{t('userManual.report.updateHistory')}</h4>
                <div className="user-manual-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{t('userManual.report.updateHeaders.version')}</th>
                        <th>{t('userManual.report.updateHeaders.date')}</th>
                        <th>{t('userManual.report.updateHeaders.description')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {updateData.map((update, index) => (
                        <tr key={index}>
                          <td>{update.version}</td>
                          <td>{update.date}</td>
                          <td>{update.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManual;