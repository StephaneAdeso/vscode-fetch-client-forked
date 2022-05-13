import React, { useEffect } from 'react';
import { useState } from "react";
import { useSelector } from 'react-redux';
import { IRootState } from '../../../reducer/combineReducer';
import { NotesEditor } from '../../Common/NotesEditor';
import { TestResult } from '../../TestUI/TestResult';
import { ResponseCookies } from "../OptionsPanel/Options/Cookies";
import { ResponseHeaders } from "../OptionsPanel/Options/Headers";
import { ResponseSection } from "../OptionsPanel/Options/Response";
import { ResponseOptionsTab } from "../OptionsPanel/OptionTab";
import "./style.css";

export const ReponsePanel = (props: any) => {

  const { loading } = useSelector((state: IRootState) => state.responseData);

  const [selectedTab, setSelectedTab] = useState("response");

  const CodeSnippetGenerator = React.lazy(() => import('../../Common/CodeGenerator'));

  const renderOptionsUI = (tab: string) => {
    switch (tab) {
      case 'headers':
        return <ResponseHeaders />;
      case 'cookies':
        return <ResponseCookies />;
      case 'testresults':
        return <TestResult />;
      case 'codesnippet':
        return <React.Suspense fallback={<div>loading...</div>}><CodeSnippetGenerator /></React.Suspense>;
      case 'notes':
        return <NotesEditor />;
      default:
        return <></>;
    }
  };

  useEffect(() => {
    if (loading) {
      setSelectedTab("response");
    }
  }, [loading]);

  return (
    <div className="response-panel">
      <div className="response-container">
        <ResponseOptionsTab selectedTab={selectedTab} setSelectedTab={setSelectedTab} isVerticalLayout={props.isVerticalLayout} />
        <div className={props.isVerticalLayout ? "response-options-tab-panel-vertical" : "response-options-tab-panel"}>
          <div className={selectedTab === "response" ? "res-visible" : "res-hidden"}>
            <ResponseSection />
          </div>
          {renderOptionsUI(selectedTab)}
        </div>
      </div>
    </div>
  );
};