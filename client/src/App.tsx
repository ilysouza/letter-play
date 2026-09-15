import React, { useState, useEffect } from "react";
import { Screen, Teacher, Student } from "@/types";
import { checkAndSeedData, getStoredStudents, getStoredTeachers } from "@/store";

// Telas principais
import HomeScreen from "@/pages/HomeScreen";
import TeacherLogin from "@/pages/TeacherLogin";
import TeacherRegister from "@/pages/TeacherRegister";
import TeacherDashboard from "@/pages/TeacherDashboard";
import StudentLogin from "@/pages/StudentLogin";
import StudentHub from "@/pages/StudentHub";

// As 10 atividades educativas
import DragDropGame from "@/pages/games/DragDropGame";
import SpellingQuizGame from "@/pages/games/SpellingQuizGame";
import WordRaceGame from "@/pages/games/WordRaceGame";
import WordSearchGame from "@/pages/games/WordSearchGame";
import ImageWordGame from "@/pages/games/ImageWordGame";
import CrosswordGame from "@/pages/games/CrosswordGame";
import MathGame from "@/pages/games/MathGame";
import DrawingGame from "@/pages/games/DrawingGame";
import MathPortuguesGame from "@/pages/games/MathPortuguesGame";
import LetterHuntGame from "@/pages/games/LetterHuntGame";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  // Inicializa dados com seed de demonstração na 1ª execução
  useEffect(() => {
    checkAndSeedData();

    // Suporte a ?screen=<nome> na URL para inspeção rápida de qualquer tela
    try {
      const params = new URLSearchParams(window.location.search);
      const demoScreen = params.get("screen") as Screen | null;
      const students = getStoredStudents();
      const teachers = getStoredTeachers();

      if (demoScreen) {
        if (demoScreen.startsWith("teacher-") && teachers.length > 0) {
          setCurrentTeacher(teachers[0]);
        } else if (students.length > 0) {
          setCurrentStudent(students[0]);
        }
        setScreen(demoScreen);
      }
    } catch (e) {
      console.warn("URL param read error", e);
    }
  }, []);

  // Navegação com re-busca do aluno para garantir dados frescos no StudentHub
  const navigate = (target: Screen) => {
    if (target === "student-hub" && currentStudent) {
      const freshStudents = getStoredStudents();
      const updated = freshStudents.find((s) => s.id === currentStudent.id);
      if (updated) setCurrentStudent(updated);
    }
    setScreen(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-['Nunito',sans-serif]">
      {/* 1. Tela Inicial */}
      {screen === "home" && (
        <HomeScreen onNavigate={(dest) => navigate(dest)} />
      )}

      {/* 2. Login e Registro do Professor */}
      {screen === "teacher-login" && (
        <TeacherLogin
          onSuccess={(t) => {
            setCurrentTeacher(t);
            navigate("teacher-dashboard");
          }}
          onNavigateRegister={() => navigate("teacher-register")}
          onBack={() => navigate("home")}
        />
      )}

      {screen === "teacher-register" && (
        <TeacherRegister
          onSuccess={(t) => {
            setCurrentTeacher(t);
            navigate("teacher-dashboard");
          }}
          onBackToLogin={() => navigate("teacher-login")}
        />
      )}

      {screen === "teacher-dashboard" && currentTeacher && (
        <TeacherDashboard
          teacher={currentTeacher}
          onLogout={() => {
            setCurrentTeacher(null);
            navigate("home");
          }}
        />
      )}

      {/* 3. Login e Central do Aluno */}
      {screen === "student-login" && (
        <StudentLogin
          onSuccess={(s) => {
            setCurrentStudent(s);
            navigate("student-hub");
          }}
          onBack={() => navigate("home")}
        />
      )}

      {screen === "student-hub" && currentStudent && (
        <StudentHub
          student={currentStudent}
          onSelectGame={(gameScreen) => navigate(gameScreen)}
          onLogout={() => {
            setCurrentStudent(null);
            navigate("home");
          }}
        />
      )}

      {/* 4. Os 9 Jogos Educativos */}
      {currentStudent && (
        <>
          {screen === "game-drag-drop" && (
            <DragDropGame student={currentStudent} onBack={() => navigate("student-hub")} />
          )}

          {screen === "game-spelling-quiz" && (
            <SpellingQuizGame student={currentStudent} onBack={() => navigate("student-hub")} />
          )}

          {screen === "game-word-race" && (
            <WordRaceGame student={currentStudent} onBack={() => navigate("student-hub")} />
          )}

          {screen === "game-word-search" && (
            <WordSearchGame student={currentStudent} onBack={() => navigate("student-hub")} />
          )}

          {screen === "game-image-word" && (
            <ImageWordGame student={currentStudent} onBack={() => navigate("student-hub")} />
          )}

          {screen === "game-crossword" && (
            <CrosswordGame student={currentStudent} onBack={() => navigate("student-hub")} />
          )}

          {screen === "game-math" && (
            <MathGame student={currentStudent} onBack={() => navigate("student-hub")} />
          )}

          {screen === "game-drawing" && (
            <DrawingGame student={currentStudent} onBack={() => navigate("student-hub")} />
          )}

          {screen === "game-math-portugues" && (
            <MathPortuguesGame student={currentStudent} onBack={() => navigate("student-hub")} />
          )}

          {screen === "game-letter-hunt" && (
            <LetterHuntGame student={currentStudent} onBack={() => navigate("student-hub")} />
          )}
        </>
      )}
    </div>
  );
}
