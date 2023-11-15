import React, { useState, useEffect } from "react";
import "./App.css";

function getRegionText(regionCd) {
  switch (regionCd) {
    case 1:
      return "도내";
    case 2:
      return "도외";
    case 3:
      return "기타";
    default:
      return "";
  }
}

function getCalText(calCd) {
  switch (calCd) {
    case 1:
      return "고산농협";
    case 2:
      return "직접정산";
    case 3:
      return "기타";
    default:
      return "";
  }
}

function getUseText(useYn) {
  switch (useYn) {
    case "1":
      return "Y";
    case "2":
      return "N";
    default:
      return "";
  }
}

function Main() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [shipmentPlan, setShipmentPlan] = useState(null);
  const [searchParams, setSearchParams] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState();
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [selectedTdIndex, setSelectedTdIndex] = useState(null);

  const [isReady, setIsReady] = useState(false);
  const [check, setCheck] = useState(false);

  const serverUrl = "http://133.186.221.46:8090/";
  const commonCodeApiEndpoint = "test/api/commonCode";
  const customerApiEndpoint = "test/api/search/customer";
  const commonCodeUrl = `${serverUrl}${commonCodeApiEndpoint}`;
  const customerUrl = `${serverUrl}${customerApiEndpoint}`;

  const columns = [
    { headerName: "번호", field: "number" },
    { headerName: "고객사코드", field: "custCd" },
    { headerName: "고객사명", field: "custNm" },
    { headerName: "지역", field: "regionCd" },
    { headerName: "정산방법", field: "calCd" },
    { headerName: "사용여부", field: "useYn" },
  ];

  const list = async () => {
    try {
      // 필터링할 조건을 담을 변수
      const filters = {};

      // 각 필터링 항목에 대한 검사 및 설정
      if (searchParams.regionCd !== "") {
        filters.regionCd = searchParams.regionCd;
      }

      if (searchParams.calCd !== "") {
        filters.calCd = searchParams.calCd;
      }

      if (searchParams.useYn !== "") {
        filters.useYn = searchParams.useYn;
      }

      // 검색어가 입력된 경우에만 추가
      if (searchParams.custNm) {
        filters.custNm = searchParams.custNm;
      }

      const response = await fetch(customerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters), // 수정된 부분
      });

      if (!response.ok) {
        throw new Error("네트워크 응답이 올바르지 않습니다");
      }

      const result = await response.json();

      if (result.code === "0" && Array.isArray(result.data)) {
        setRowData(result.data);
      }
    } catch (error) {
      console.error("데이터를 가져오는 중 오류 발생:", error);
    }
  };

  const handleSearchParamsChange = (field, value) => {
    setSearchParams((prevParams) => ({
      ...prevParams,
      [field]: value,
    }));
  };

  const handleSearchClick = () => {
    list();
  };

  const handleUseYnCheckboxChange = (rowIndex) => {
    const updatedRowData = [...rowData];
    const toggledState = updatedRowData[rowIndex].useYn === "1" ? "2" : "1";
    updatedRowData[rowIndex].useYn = toggledState;
    updatedRowData[rowIndex].__changed = true;

    console.log("updatedRowData[rowIndex]::", updatedRowData[rowIndex]);
    setRowData(updatedRowData);
  };

  const handleTableRowClick = async (custCd) => {
    try {
      // 클릭한 데이터의 ID를 기반으로 상세정보를 불러오는 API 호출
      const detailUrl = `${serverUrl}test/api/search/customer/detail`;
      const requestBody = { custCd: custCd }; // POST 요청의 경우 body에 데이터를 넣어 전달

      const response = await fetch(detailUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        throw new Error("네트워크 응답이 올바르지 않습니다");
      }
      const result = await response.json();

      if (result.code === "0" && result.data) {
        // 성공적으로 데이터를 불러왔을 때 상세정보 갱신
        console.log("result.data", result.data);
        setSelectedCustomer(result.data);
      }
    } catch (error) {
      console.error("상세정보를 불러오는 중 오류 발생:", error);
    }
  };

  const saveCheckboxState = async (custCd, useYn) => {
    try {
      const saveUrl = `${serverUrl}test/api/save/custUseYn`;

      const requestBody = {
        data: [],
      };

      console.log("rowData::::", rowData);
      const saveData = rowData
        .filter((row) => row.__changed)
        .map((row) => {
          delete row.calCd;
          delete row.custNm;
          delete row.regionCd;
          delete row.__changed;

          return row;
        });

      console.log("saveData:::", saveData);

      requestBody.data = saveData;

      console.log("requestBody:::", requestBody);

      const response = await fetch(saveUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("네트워크 응답이 올바르지 않습니다");
      }

      const result = await response.json();

      if (result.code === "0") {
        console.log("체크박스 상태가 성공적으로 저장되었습니다.");
        list();
      }
    } catch (error) {
      console.error("체크박스 상태 저장 중 오류:", error);
    }
  };

  const handleExitClick = () => {
    if (window.confirm("정말로 종료하시겠습니까?")) {
      window.close();
    }
  };

  return (
    <div className="App">
      <div className="first">
        <div className="first-1">비즈위즈시스템</div>
        <div className="first-2">
          <i
            className="fa-solid fa-circle-user"
            style={{ marginRight: "10px" }}
          ></i>
          안민별
          <i
            className="fa-solid fa-right-from-bracket"
            style={{ marginLeft: "60px", cursor: "pointer" }}
            onClick={handleExitClick}
          ></i>
        </div>
      </div>
      <div className="second">
        <div
          className="second-1"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            className="dropdown"
            style={{ display: "inline-block", position: "relative" }}
          >
            <i
              className="fa-solid fa-bars"
              style={{ marginRight: "30px", cursor: "pointer" }}
              onClick={() => setDropdownOpen(!isDropdownOpen)}
            ></i>
            {isDropdownOpen && (
              <div
                className="dropdown-content"
                style={{
                  position: "absolute",
                  backgroundColor: "#f1f1f1",
                  minWidth: "160px",
                  boxShadow: "0px 8px 16px 0px rgba(0,0,0,0.2)",
                  zIndex: 1,
                }}
              >
                <p style={{ padding: "12px 16px", margin: 0 }}>고객사 관리</p>
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ marginRight: "20px" }}>고객사 관리</div>
          </div>
        </div>
        <div className="second-2">
          <button className="second-button" onClick={handleSearchClick}>
            조회
          </button>
          <button
            className="second-button"
            onClick={() => {
              if (selectedCustomer) {
                saveCheckboxState(
                  selectedCustomer.custCd,
                  selectedCustomer.useYn
                );
              }
            }}
          >
            저장
          </button>
        </div>
      </div>
      <div className="third">
        <div className="third-box1">
          지역
          <select
            className="third-select"
            value={searchParams?.regionCd || ""}
            onChange={(e) =>
              handleSearchParamsChange("regionCd", e.target.value)
            }
          >
            <option value="">전체</option>
            <option value="1">도내</option>
            <option value="2">도외</option>
            <option value="3">기타</option>
          </select>
        </div>
        <div className="third-box2">
          정산방법
          <select
            className="third-select"
            value={searchParams.calCd || ""}
            onChange={(e) => handleSearchParamsChange("calCd", e.target.value)}
          >
            <option value="">전체</option>
            <option value="1">고산농협</option>
            <option value="2">직접정산</option>
            <option value="3">기타</option>
          </select>
        </div>
        <div className="third-input">
          고객사명
          <input
            type="text"
            placeholder="고객사명 입력"
            style={{ marginLeft: "10px", width: "15vw", height: "30px" }}
            onChange={(e) => handleSearchParamsChange("custNm", e.target.value)}
          />
        </div>
        <div className="third-box3">
          사용여부
          <select
            className="third-select"
            value={searchParams.useYn || ""}
            onChange={(e) => handleSearchParamsChange("useYn", e.target.value)}
          >
            <option value="">전체</option>
            <option value="1">Y</option>
            <option value="2">N</option>
          </select>
        </div>
      </div>
      <div className="boxes">
        <div className="box1">
          <div className="box1-title">고객사 목록</div>
          <div>
            <table className="table-container">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.field}>{col.headerName}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ height: "60vh", border: "1px solid gray" }}>
                {rowData === null ? ( // rowData가 null이면 빈 테이블을 보여줌
                  <tr>
                    <td colSpan={columns.length}>데이터가 없습니다.</td>
                  </tr>
                ) : (
                  // 아니면 데이터를 렌더링
                  rowData.map((dataRow, rowIndex) => {
                    return (
                      <tr
                        key={rowIndex}
                        onClick={() => handleTableRowClick(dataRow.custCd)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{rowIndex + 1}</td>
                        <td>{dataRow.custCd}</td>
                        <td>{dataRow.custNm}</td>
                        <td>{getRegionText(parseInt(dataRow.regionCd))}</td>
                        <td>{getCalText(parseInt(dataRow.calCd))}</td>
                        <td>
                          <input
                            type="checkbox"
                            id={`useYnCheckbox_${rowIndex}`}
                            checked={dataRow.useYn === "1"}
                            onChange={() => handleUseYnCheckboxChange(rowIndex)}
                          />
                          <label htmlFor={`useYnCheckbox_${rowIndex}`}>
                            {getUseText(parseInt(dataRow.useYn))}
                          </label>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="box2">
          <div className="box2-line">
            <div className="box2-title">고객사 상세정보</div>
            <div>
              <i
                className="fa-solid fa-plus"
                style={{ marginRight: "20px" }}
              ></i>
              <i className="fa-regular fa-floppy-disk"></i>
            </div>
          </div>
          {/*고객사 상세정보 */}
          <div className="user-information">
            {
              <>
                <div className="user" style={{ marginTop: "2vh" }}>
                  고객사코드
                  <input
                    type="text"
                    className="user-input"
                    value={selectedCustomer ? selectedCustomer.custCd : null}
                  />
                </div>
                <div className="user">
                  고객사명
                  <input
                    type="text"
                    placeholder="고객사명 입력"
                    className="user-input"
                    value={selectedCustomer ? selectedCustomer.regionCd : null}
                  />
                </div>
                <div className="user">
                  지역
                  <select
                    className="user-select"
                    value={selectedCustomer ? selectedCustomer.regionCd : null}
                    onChange={(e) =>
                      handleSearchParamsChange("regionCd", e.target.value)
                    }
                  >
                    <option value="">전체</option>
                    <option value="1">도내</option>
                    <option value="2">도외</option>
                    <option value="3">기타</option>
                  </select>
                </div>
                <div className="user">
                  정산방법
                  <select
                    className="user-select"
                    value={selectedCustomer ? selectedCustomer.calCd : null}
                    onChange={(e) =>
                      handleSearchParamsChange("calCd", e.target.value)
                    }
                  >
                    <option value="">전체</option>
                    <option value="1">고산농협</option>
                    <option value="2">직접정산</option>
                    <option value="3">기타</option>
                  </select>
                </div>
                <div className="user">
                  출하계획
                  <div
                    style={{
                      border: "1px solid black",
                      padding: "7px",
                      width: "300px",
                      backgroundColor: "#ffff",
                      display: "flex",
                      marginRight: "3vw",
                    }}
                  >
                    <div style={{ marginLeft: "50px", marginRight: "50px" }}>
                      <input
                        type="checkbox"
                        id="shipmentPlanCheckbox"
                        checked={
                          selectedCustomer
                            ? selectedCustomer.shipmentYn === "Y"
                              ? true
                              : false
                            : false
                        }
                        onChange={(e) => {
                          console.log("selectedCustomer", selectedCustomer);
                          setShipmentPlan(e.target.checked);
                        }}
                      />
                      <label htmlFor="shipmentPlanCheckbox">사용</label>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        id="noShipmentPlanCheckbox"
                        checked={
                          selectedCustomer
                            ? selectedCustomer.shipmentYn === "Y"
                              ? false
                              : true
                            : false
                        }
                        onChange={(e) => setShipmentPlan(!e.target.checked)}
                      />
                      <label htmlFor="noShipmentPlanCheckbox">미사용</label>
                    </div>
                  </div>
                </div>
                <div className="user">
                  전화번호
                  <input
                    type="text"
                    placeholder="고객사명 입력"
                    className="user-input"
                    value={selectedCustomer ? selectedCustomer.telNo : null}
                  />
                </div>
                <div className="user">
                  팩스번호
                  <input
                    type="text"
                    placeholder="고객사명 입력"
                    className="user-input"
                    value={selectedCustomer ? selectedCustomer.faxNo : null}
                  />
                </div>
                <div className="user">
                  우편번호
                  <input
                    type="text"
                    placeholder="고객사명 입력"
                    className="user-input"
                    style={{ position: "relative" }}
                    value={selectedCustomer ? selectedCustomer.postNo : null}
                  />
                  <i
                    className="fa-solid fa-magnifying-glass"
                    style={{
                      position: "absolute",
                      cursor: "pointer",
                      right: "150px",
                    }}
                  ></i>
                </div>
                <div className="user">
                  기본주소
                  <input
                    type="text"
                    placeholder="고객사명 입력"
                    className="user-input"
                    value={selectedCustomer ? selectedCustomer.addStd : null}
                  />
                </div>
                <div className="user">
                  상세주소
                  <input
                    type="text"
                    placeholder="고객사명 입력"
                    className="user-input"
                    value={selectedCustomer ? selectedCustomer.addDtl : null}
                  />
                </div>
                <div className="user">
                  담당자
                  <input
                    type="text"
                    placeholder="고객사명 입력"
                    className="user-input"
                    value={selectedCustomer ? selectedCustomer.manNm : null}
                  />
                </div>
                <div className="user">
                  담당자연락처
                  <input
                    type="text"
                    placeholder="고객사명 입력"
                    className="user-input"
                    value={selectedCustomer ? selectedCustomer.manTelNo : null}
                  />
                </div>
                <div className="user">
                  계산서수취메일
                  <input
                    type="text"
                    placeholder="고객사명 입력"
                    className="user-input"
                    value={
                      selectedCustomer ? selectedCustomer.invoiceMail : null
                    }
                  />
                </div>
              </>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
